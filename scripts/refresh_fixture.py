"""Exercise the installed LiteLLM authenticator with an in-memory OAuth server."""
import importlib.metadata
import json
import os
from pathlib import Path
import sys
from unittest.mock import patch

import httpx

directory = Path(sys.argv[1]).resolve()
assert directory.name.startswith("tokengateway-rotation-test-")
os.environ["CHATGPT_TOKEN_DIR"] = str(directory)
os.environ["CHATGPT_AUTH_FILE"] = "auth.json"
os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"

from litellm.llms.chatgpt.authenticator import Authenticator

path = directory / "auth.json"
before = json.loads(path.read_text())
assert before["refresh_token"] == "fixture-refresh-initial"
new_access = sys.argv[2]
calls = []

def oauth(request):
    assert str(request.url) == "https://auth.openai.com/oauth/token"
    body = json.loads(request.content)
    assert body["grant_type"] == "refresh_token"
    assert body["refresh_token"] == "fixture-refresh-initial"
    calls.append(body["grant_type"])
    return httpx.Response(200, json={
        "access_token": new_access,
        "refresh_token": "fixture-refresh-rotated",
        "id_token": new_access,
    })

with httpx.Client(transport=httpx.MockTransport(oauth)) as client:
    with patch("litellm.llms.chatgpt.authenticator._get_httpx_client", return_value=client):
        with patch.object(Authenticator, "_login_device_code", side_effect=AssertionError("Unexpected login")):
            assert Authenticator().get_access_token() == new_access

after = json.loads(path.read_text())
assert calls == ["refresh_token"]
assert after["access_token"] == new_access
assert after["refresh_token"] == "fixture-refresh-rotated"
assert after["expires_at"] > before["expires_at"]
print(json.dumps({"litellm_version": importlib.metadata.version("litellm"), "refresh_calls": len(calls)}))
