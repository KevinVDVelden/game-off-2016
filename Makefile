SRC_DIR=src
OUT_DIR=out

JS_SOURCE=$(shell find $(SRC_DIR) -name *.js)
JS_OUT=$(patsubst $(SRC_DIR)/%.js,$(OUT_DIR)/%.js,$(JS_SOURCE))
JS_OUT_MIN=$(patsubst %.js,%.min.js,$(JS_OUT))
TARGETS+=$(JS_OUT_MIN) $(JS_OUT)

LESS_SOURCE=$(shell find $(SRC_DIR) -name *.less)
LESS_OUT=$(patsubst $(SRC_DIR)/%.less,$(OUT_DIR)/%.css,$(LESS_SOURCE))
LESS_OUT_MIN=$(patsubst %.css,%.min.css,$(LESS_OUT))
TARGETS+=$(LESS_OUT_MIN) $(LESS_OUT)

all: $(TARGETS)

clean:
	rm -r $(OUT_DIR)

$(OUT_DIR)/%.js: $(SRC_DIR)/%.js $(dir $@)
	@mkdir -pv $(dir $@)
	$(JS_TRANSPILER) -s -o $@ $<

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
