MCP_ADDR ?= http://127.0.0.1:3333/mcp

ifdef MCP_URL
MCP_ADDR := $(MCP_URL)
endif

.PHONY: mcp-inspector
mcp-inspector:
	./scripts/mcp-inspector.sh "$(MCP_ADDR)"
