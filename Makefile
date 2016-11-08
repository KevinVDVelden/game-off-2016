SRC_DIR=src
OUT_DIR=out

COFFEE_SOURCE=$(shell find $(SRC_DIR) -name *.coffee)
COFFEE_OUT=$(patsubst $(SRC_DIR)/%.coffee,$(OUT_DIR)/%.js,$(COFFEE_SOURCE))
COFFEE_OUT_MIN=$(patsubst %.js,%.min.js,$(COFFEE_OUT))
TARGETS+=$(COFFEE_OUT_MIN) $(COFFEE_OUT)

LESS_SOURCE=$(shell find $(SRC_DIR) -name *.less)
LESS_OUT=$(patsubst $(SRC_DIR)/%.less,$(OUT_DIR)/%.css,$(LESS_SOURCE))
LESS_OUT_MIN=$(patsubst %.css,%.min.css,$(LESS_OUT))
TARGETS+=$(LESS_OUT_MIN) $(LESS_OUT)

all: $(TARGETS)

clean:
	rm -r $(OUT_DIR)

$(OUT_DIR)/%.js: $(SRC_DIR)/%.coffee
	$(COFFEE_TRANSPILER) -c -b -m -o $(OUT_DIR) $<

%.min.js: %.js
	cp $< $@

$(OUT_DIR)/%.css: $(SRC_DIR)/%.less
	lessc --source-map $< $@

$(OUT_DIR)/%.min.css: $(OUT_DIR)/%.css
	cp $< $@

$(TARGETS): $(OUT_DIR)

$(OUT_DIR):
	mkdir $(OUT_DIR) -p

include config.mk
