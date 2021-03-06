"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function(path) {
  return intern.config.siteRoot + path;
};

registerSuite("User Activity (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "We're at the right place"() {
      var username;
      return FunctionalHelpers.openPage(this, url("/me"), ".js-username")
        .findByCssSelector(".wc-UIContent .wc-Title--l")
        .getVisibleText()
        .then(function(text) {
          var usernameEnd = text.indexOf("'s activity");
          username = text.slice(0, usernameEnd);
        })
        .getCurrentUrl()
        .then(function(currURL) {
          assert.include(
            currURL,
            username,
            "The redirected URL has our username in it."
          );
        })
        .end();
    },

    "IssueListView renders"() {
      return FunctionalHelpers.openPage(this, url("/me"), ".js-list-issue")
        .findDisplayedByCssSelector(".js-list-issue")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList container is visible.");
        })
        .end()
        .findDisplayedByCssSelector(".js-list-issue .js-IssueList")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList item is visible.");
        })
        .end()
        .findByCssSelector(".js-IssueList .wc-IssueList-header")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /^Issue\s\d+:\s.+$/,
            "Issue should have a non-empty title"
          );
        })
        .end()
        .findByCssSelector(
          ".js-IssueList:nth-child(1) > div:nth-child(1) > p:nth-child(2)"
        )
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /comments:\s\d+$/i,
            "Issue should display number of comments"
          );
          assert.match(
            text,
            /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/,
            "Issue should display creation date"
          );
        })
        .end();
    },

    "Trying to view someone else's activity fails (logged in)"() {
      return FunctionalHelpers.openPage(
        this,
        url("/activity/someoneelse"),
        ".wc-UIContent"
      )
        .findByCssSelector(".wc-UIContent .wc-Title--l")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "Forbidden",
            "Get a 403 when trying to view someone else's activity"
          );
        })
        .end();
    }
  }
});
