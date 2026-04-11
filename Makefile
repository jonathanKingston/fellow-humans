DIST_DIR := dist
CHROME_PACKAGE := $(DIST_DIR)/fellow-humans-chrome.zip
FIREFOX_PACKAGE := $(DIST_DIR)/fellow-humans-firefox.xpi

.PHONY: all build clean

all: build

build: clean $(CHROME_PACKAGE) $(FIREFOX_PACKAGE)

$(CHROME_PACKAGE): | $(DIST_DIR)
	cd src && zip -X -r "../$@" .

$(FIREFOX_PACKAGE): | $(DIST_DIR)
	cd src && zip -X -r "../$@" .

$(DIST_DIR):
	mkdir -p "$(DIST_DIR)"

clean:
	rm -rf "$(DIST_DIR)"
