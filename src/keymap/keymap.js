const waitForRender = require('../wait-for-render');

/**
 * Adds useful keymappings to pull requests on bitbucket.org
 * @module keymap
 */
var PrKeyMap = (function($) {
    'use strict';

    /**
     * The default keymap for key binds a.k.a. shortcut keys.
     */
    const default_keymap = {
        tab_overview: '1',
        tab_commits: '2',
        tab_activity: '3',

        scroll_next_comment: 'N',
        scroll_previous_comment: 'P',
        scroll_page_top: 'g g',
        scroll_page_bottom: 'G'
    };

    var keymap = {};

    const ids = {
        overview: '#pr-menu-diff',
        commits: '#pr-menu-commits',
        activity: '#pr-menu-activity'
    };

    var self = {};

    self.commentSelector = '.iterable-item a.author';
    self.iterableItemSelector = '.iterable-item';
    self.comments = [];

    self.currentComment = 0;

    /**
     * Switches to a tab, if there is a selector available for that tab.
     */
    self.switchTo = function(tabName) {
        if (tabName in ids) {
            const element = document.querySelector(ids[tabName]);
            element.click();
        }
    };

    /**
     * Sets focus to a particular comment.
     *
     * 'j' and 'k' by default will go down and up (respectively) through iterable
     * elements on the page (file list, comments, patches).
     * This provides compatibility with BitBucket's built in key binds
     * so that we don't break the existing functionality of the 'j' and 'k' keys.
     *
     */
    self.focusComment = function(comment) {
        $(self.iterableItemSelector).removeClass('focused');
        $(comment).addClass('focused');
        comment.scrollIntoView();
    };

    /**
     * Initializes array of comments elements to cycle through using
     * {@link #scrollToNextComment} or {@link #scrollToPreviousComment}.
     */
    self.initComments = function() {
        if (self.comments.length === 0) {
            self.comments = document.querySelectorAll(self.commentSelector);
        }
    };

    /**
     * Scrolls the browser window to the previous comment on the PR diff.
     *
     * If scrolling to the next comment from the last comment, this will loop back
     * to the top-most (first) comment on the page.
     *
     */
    self.scrollToNextComment = function() {
        self.initComments();

        if (self.comments) {
            $(self.comments[self.currentComment]).removeClass('focused');
            self.currentComment++;
            if (self.currentComment >= self.comments.length) self.currentComment = 0;

            var comment = self.comments[self.currentComment].parentElement.parentElement;
            self.focusComment(comment);
        }
    };

    /**
     * Scrolls the browser window to the previous comment on the PR diff.
     *
     * If scrolling to previous comment from the top commit, this will loop back to the
     * bottom-most (last) comment on the page.
     */
    self.scrollToPreviousComment = function() {
        self.initComments();

        if (self.comments) {
            self.currentComment--;
            if (self.currentComment < 0) self.currentComment = self.comments.length - 1;

            var comment = self.comments[self.currentComment].parentElement.parentElement;
            self.focusComment(comment);
        }
    };

    /**
     * Initializes keybinds.
     *
     * @param {Object} keyboard the keyboard library to use to bind keys (usually Mousetrap).
     * @param {Object} user_keymap the user-defined keymap to override default keybindings.
     */
    self.init = function(keyboard, userKeymap) {

        Object.assign(keymap, default_keymap);
        if (userKeymap) {
            //if provided, copy a user-preferred keymap to the main keymap.
            Object.assign(keymap, userKeymap);
        }

        keyboard.reset();
        self.comments = document.querySelectorAll(self.commentSelector);

        keyboard.bind(keymap.tab_overview, (event) => {
            event.preventDefault();
            self.switchTo('overview');
            waitForRender('.bb-patch').then(() => {
        });

        keyboard.bind(keymap.tab_commits, (event) => {
            event.preventDefault();
            self.switchTo('commits');
        });

        keyboard.bind(keymap.tab_activity, (event) => {
            event.preventDefault();
            self.switchTo('activity');
        });

        waitForRender('.bb-patch').then(() => {
            //only bind next and previous comments when the diff patches have finished loading
            keyboard.bind(keymap.scroll_next_comment, (event) => {
                event.preventDefault();
                self.scrollToNextComment();
            });

            keyboard.bind(keymap.scroll_previous_comment, (event) => {
                event.preventDefault();
                self.scrollToPreviousComment();
            });
        });

        keyboard.bind(keymap.scroll_page_top, (event) => {
            //gg to scroll to top
            event.preventDefault();
            window.scrollTo(0, 0);
        });

        keyboard.bind(keymap.scroll_page_bottom, (event) => {
            //scroll to bottom
            window.scrollTo(0, document.body.scrollHeight);
        });
    };

    return self;

})(jQuery);

module.exports = (() => {
    return {
        init
    };

    function init(keyboard) {
        PrKeyMap.init(keyboard);
    }
})();
