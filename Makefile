.PHONY: test test-ci-coverage release

_MOCHA=node_modules/.bin/_mocha
ISTANBUL=node_modules/.bin/istanbul
COVERALLS=node_modules/.bin/coveralls

test:
	npm run test-ci

test-ci-coverage:
	npm install coveralls
	npm install istanbul
	@rm -rf coverage
	npm run clean
	$(ISTANBUL) cover $(_MOCHA) --report lcovonly -- -R tap

	@echo
	@echo Sending report to coveralls.io...
	@cat ./coverage/lcov.info | $(COVERALLS)
	@rm -rf ./coverage
	@echo Done

release: test
ifeq ($(strip $(version)),)
	@echo "\033[31mERROR:\033[0;39m No version provided"
	@echo "\033[1;30mmake release version=1.0.0\033[0;39m"
else
ifneq ($(shell git diff --stat),)
	@echo "Changes must be committed before running a release"
endif
	npm version $(version)
	npm publish
	git push origin master
	git push origin --tags
