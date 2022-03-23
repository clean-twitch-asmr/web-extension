.PHONY: help # List available tasks
help:
	@echo ""
	@echo "List of tasks available:"
	@echo ""
	@grep '^.PHONY: .* #' Makefile | sed 's/\.PHONY: \(.*\) # \(.*\)/- \1: \2/' | expand -t20
	@echo ""

.PHONY: clean # Clean webextension
clean:
	@rm -rf $(CHROME_DIST)
	@mkdir $(CHROME_DIST)

.PHONY: build # Build the Chrome web extension
build: clean generate-manifest generate-scripts

.PHONY: fetch-hide-list
fetch-hide-list:
	@npx ts-node scripts/fetch-hide-list.ts

.PHONY: generate-scripts
generate-scripts:
	@npx esbuild --bundle --platform=browser --outdir=$(CHROME_DIST) src/document.ts
	@npx esbuild --bundle --platform=browser --outdir=$(CHROME_DIST) src/background.ts

.PHONY: generate-manifest
generate-manifest:
	@npx ts-node ./scripts/generate-manifest.ts
