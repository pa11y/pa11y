# Reusable Makefile
# ------------------------------------------------------------------------
# This section of the Makefile should not be modified, it includes
# commands from my reusable Makefile: https://github.com/rowanmanning/make
include node_modules/@rowanmanning/make/javascript/index.mk
# [edit below this line]
# ------------------------------------------------------------------------

export INTEGRATION_TIMEOUT := 7000
export INTEGRATION_SLOW := 4000
export INTEGRATION_TEST_MOCHA_FLAGS := --exit
