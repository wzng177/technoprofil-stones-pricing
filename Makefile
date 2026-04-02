PDF_PATH ?= docs/examples/ex1/input.pdf

serve:
	uvicorn server.api:app --reload --port 8000

query:
	curl -s -X POST http://localhost:8000/extract \
		-F "file=@$(PDF_PATH)" | python3 -m json.tool