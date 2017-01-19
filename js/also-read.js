/*
 * はてなブログに関連エントリを追加する
 * HatenaBlog Also read (c) 2015,2017 Pocket Systems. http://psn.hatenablog.jp/entry/also-read
 * Released under the MIT license
 */
// ==ClosureCompiler==
// @output_file_name also-read.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_wrapper (function() {%output%})();
// ==/ClosureCompiler==
/**
 * @preserve HatenaBlog Also read (c) 2017 Pocket Systems. | MIT | psn.hatenablog.jp/entry/also-read
 * (・ω・) where to go? https://www.youtube.com/watch?v=nbeGeXgjh9Q
 */ 
/*
部分データ 170116
*/
var Htnpsne;
(function (Htnpsne) {
    var API;
    (function (API) {
        "use strict";
        //TODO
        /* tslint:disable */
        var HeadTag = document.getElementsByTagName("head")[0];
        var delayedFlg = { HatenaTime: false, GoogleAds: false };
        API.version = "1.0.2";
        API.htmlTagData = document.getElementsByTagName("html")[0].dataset;
    })(API = Htnpsne.API || (Htnpsne.API = {}));
})(Htnpsne || (Htnpsne = {}));
/// <reference path="also-read.header.ts" />
/// <reference path="htnpsne.api.ts" />
/* tslint:disable:no-string-literal */
var Htnpsne;
(function (Htnpsne) {
    var Alsoread;
    (function (Alsoread) {
        "use strict";
        var blogsUriBase = Htnpsne.API.htmlTagData.blogsUriBase;
        // let blogBase: string = Htnpsne.API.htmlTagData.blog;
        var categoryPath = "/archive/category/";
        var rssPath = "/rss/category/";
        var loadCSS = true;
        var categoryList = [];
        var feedlyURL = "http://cloud.feedly.com/#subscription%2Ffeed%2F";
        var externalCSS = "//niyari.github.io/hatenablog-modules/css/also-read.css";
        var defaultModuleTitle = "あわせて読みたい";
        // カテゴリリスト取得
        function getCategoryList() {
            var list = [];
            var targetDomain = blogsUriBase.split("://")[1];
            // TODO: "body.page-entry div.categories a" のみで良い/スマホ版の「記事下のカテゴリ表示」に対応
            var selector = "body.page-entry div.categories a";
            var entryCategoryList = document.querySelectorAll(selector);
            for (var i = 0; i < entryCategoryList.length; i++) {
                var listAnchor = entryCategoryList[i];
                var listAnchorHref = listAnchor.href.split(targetDomain + categoryPath)[1];
                if (typeof (listAnchor) !== "undefined") {
                    list.push(listAnchorHref);
                }
                ;
            }
            return list;
        }
        // RSS受信
        function getRSS(targetID, url) {
            var list = [];
            $.ajax({
                dataType: "xml",
                url: url
            }).done(function (data, status, xhr) {
                // RSSリスト整形
                $(data).find("item").each(function () {
                    if (/^\/entry/.test(location.pathname) === false || location.origin + location.pathname !== $(this).find("link").text()) {
                        // /^\/entry/.test(location.pathname) は、記事ページではない場合の計算コストを考慮する為に書いた(要検証)
                        list.push({
                            "title": $(this).find("title").text(),
                            "link": $(this).find("link").text()
                        });
                    }
                });
                insertEntryList(targetID, list);
            }).fail(function (xhr, status, error) {
                // 通信失敗
                insertEntryList(targetID, [{
                        "title": "(取得できませんでした。再読み込みを行ってください)",
                        "link": blogsUriBase
                    }]);
            });
        }
        // JSONP(はてなブックマーク)受信
        function getHatebu(targetID, url) {
            var list = [];
            $.ajax({
                dataType: "jsonp",
                url: "http://b.hatena.ne.jp/entrylist/json",
                data: {
                    "sort": "count",
                    "url": url
                }
            }).done(function (data, status, xhr) {
                for (var i = 0; i < data.length; i++) {
                    if (/\/entry\//.test(data[i].link) === true &&
                        location.origin + location.pathname !== data[i].link) {
                        list.push({
                            "title": data[i].title,
                            "count": data[i].count,
                            "link": data[i].link
                        });
                    }
                    else {
                        console.log("対象のページを除外しました。(B!)");
                    }
                }
                insertEntryList(targetID, list);
            }).fail(function (xhr, status, error) {
                // 通信失敗
                insertEntryList(targetID, [{
                        "title": "(取得できませんでした。再読み込みを行ってください)",
                        "link": blogsUriBase
                    }]);
            });
        }
        // 初期処理
        function setupModule() {
            categoryList = getCategoryList();
            var target = document.querySelectorAll(".js-htnpsne-awasete-module");
            for (var i = 0; i < target.length; i++) {
                var targetElem = target[i];
                if (targetElem.dataset["userCss"] === "true") {
                    loadCSS = false;
                }
                var mode = targetElem.dataset["mode"];
                // カテゴリーが設定されていない事がある　ランダムでも良いかもしれない
                if (categoryList.length === 0) {
                    mode = listShuffle(["Recent", "Popular"])[0];
                }
                else {
                    categoryList = listShuffle(categoryList);
                }
                if (mode === "Popular") {
                    createModuleBody(targetElem, Math.random().toString(36).slice(6), "Popular");
                    getHatebu(targetElem.dataset["targetId"], blogsUriBase);
                }
                else if (mode === "Recent") {
                    createModuleBody(targetElem, Math.random().toString(36).slice(6), "Recent");
                    getRSS(targetElem.dataset["targetId"], blogsUriBase + "/rss");
                }
                else {
                    createModuleBody(targetElem, Math.random().toString(36).slice(6), categoryList[0]);
                    getRSS(targetElem.dataset["targetId"], blogsUriBase + rssPath + categoryList[0]);
                }
                $("#Htn-psne-Awasete-Link-" + targetElem.dataset["targetId"]).tipsy({ opacity: 1, gravity: "s" }); // はてなブログ依存のツールチップ
            }
            setupEventListener();
            if (loadCSS) {
                // デフォルトCSS読み込み
                setupCSS(externalCSS);
            }
            if (Htnpsne.API.htmlTagData.page === "about") {
                // 描画用コードの動作確認
                moduleExecuteTest();
            }
            ;
        }
        // 描画用コードの動作確認
        function moduleExecuteTest() {
            // TODO
            return;
        }
        // CSSをリンクする
        function setupCSS(url) {
            var elmSideMenuCSS = document.createElement("link");
            elmSideMenuCSS.href = url;
            elmSideMenuCSS.rel = "stylesheet";
            elmSideMenuCSS.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(elmSideMenuCSS);
        }
        // Fisher-Yatesアルゴリズムでシャッフルする
        function listShuffle(a) {
            var b, c, d;
            a = a.slice();
            b = a.length;
            if (0 === b) {
                return a;
            }
            ;
            for (; --b;) {
                c = Math.floor(Math.random() * (b + 1));
                d = a[b];
                a[b] = a[c];
                a[c] = d;
            }
            ;
            return a;
        }
        // 文字列をエスケープするやつ
        /*
        function escapeHtml(a) {
            return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        };
         */
        // リスト生成
        function insertEntryList(targetID, list) {
            var targetDiv = document.querySelector(".js-htnpsne-awasete-entrys[data-target-id=\"" + targetID + "\"]");
            var count = parseInt(targetDiv.dataset["count"], 10);
            var trackParameters = typeof (targetDiv.dataset["trackParameters"]) === "undefined"
                ? "" : targetDiv.dataset["trackParameters"];
            var listType = typeof (targetDiv.dataset["listType"]) === "undefined" ? "" : targetDiv.dataset["listType"];
            // displayBookmark_countは「true/false」が入っているが、後の扱いの為にboolではなくstringとする
            var displayBookmark_count = typeof (targetDiv.dataset["displayBookmark_count"]) === "undefined"
                ? "false" : targetDiv.dataset["displayBookmark_count"];
            targetDiv.innerHTML = "";
            if (list.length === 0) {
                list = [{
                        "link": blogsUriBase,
                        "title": "ブログTOPへ"
                    }];
            }
            list = listShuffle(list);
            if (count > list.length) {
                count = list.length;
            }
            else if (count === 0) {
                count = 3;
            }
            // TODO:はてなブログのブログパーツ経由で表示させているが、オリジナルのHTMLを出力が必要か(要望があるか)確認する
            // その際、はてブの一覧ので画像表示にコストが掛かるため、実装の前にどうにかする必要がある
            if (listType === "list") {
                var elem = document.createElement("ul");
                var _loop_1 = function (i) {
                    var listElem = document.createElement("li");
                    var listElemAnchor = document.createElement("a");
                    listElemAnchor.href = list[i].link + trackParameters;
                    listElemAnchor.textContent = list[i].title;
                    if (displayBookmark_count === "true") {
                        listElemAnchor.appendChild((function () {
                            var listImageElem = document.createElement("img");
                            listImageElem.src = "http://b.st-hatena.com/entry/image/" + list[i].link;
                            listImageElem.className = "bookmark-count";
                            listImageElem.alt = "Hatena Bookmark - " + listElemAnchor.textContent;
                            return listImageElem;
                        })());
                    }
                    listElem.appendChild(listElemAnchor);
                    elem.appendChild(listElem);
                };
                for (var i = 0; i < count; i++) {
                    _loop_1(i);
                }
                targetDiv.appendChild(elem);
            }
            else {
                // iframe
                // iframe版はdisplayBookmark_countはtrue扱いとなる
                for (var i = 0; i < count; i++) {
                    var elem = document.createElement("iframe");
                    // TODO: 新設class js-htnpsne-awasete-embed-blogcard / width:"100%" display:"block"
                    elem.className = "embed-card embed-blogcard js-htnpsne-awasete-embed-blogcard";
                    elem.style.display = "block";
                    elem.style.width = "100%";
                    elem.frameBorder = "0";
                    elem.scrolling = "no";
                    elem.title = list[i].title;
                    // ブログパーツ経由にする 外部サイト経由のアクセスとしてはてなブログのアクセス解析に載る
                    // 他にも //psn.hatenablog.jp/embed/also-read というようにembedに置換しても良い (アクセス解析に載らない)
                    elem.src = "http://hatenablog-parts.com/embed?url=" + encodeURIComponent(list[i].link + trackParameters);
                    targetDiv.appendChild(elem);
                }
            }
        }
        function createModuleBody(targetDiv, targetID, targetListName) {
            var moduleOuter = document.createElement("div");
            moduleOuter.dataset["targetId"] = targetID;
            targetDiv.dataset.targetId = targetID;
            var displayModuleTitle = typeof (targetDiv.dataset.title) === "undefined" || targetDiv.dataset.title === "" ?
                defaultModuleTitle : targetDiv.dataset.title;
            var moduleInner = document.createElement("aside");
            var moduleControlPanel = document.createElement("h1");
            moduleControlPanel.className = "js-htnpsne-awasete-control-outer";
            // タイトル
            moduleControlPanel.appendChild((function () {
                var awaseteTitle = document.createElement("span");
                awaseteTitle.className = "js-htnpsne-awasete-title";
                awaseteTitle.textContent = displayModuleTitle;
                return awaseteTitle;
            })());
            // 操作領域
            var awaseteControl = (function () {
                var controlElem = document.createElement("span");
                controlElem.className = "js-htnpsne-awasete-control";
                var alsoReadLink = document.createElement("a");
                alsoReadLink.href = "http://psn.hatenablog.jp/entry/also-read";
                alsoReadLink.id = "Htn-psne-Awasete-Link-" + targetID;
                alsoReadLink.title = "この機能は何？";
                alsoReadLink.target = "_blank";
                alsoReadLink.innerHTML = "<i class=\"blogicon-help\"></i>";
                controlElem.appendChild(alsoReadLink);
                return controlElem;
            })();
            moduleControlPanel.appendChild(awaseteControl);
            // カテゴリーや新着・人気エントリーのセレクトボックス
            var awaseteSelectBox = (function () {
                var selectBoxElem = document.createElement("select");
                selectBoxElem.className = "js-htnpsne-awasete-select";
                selectBoxElem.dataset["targetId"] = targetID;
                // セレクトボックスの中身を作成
                var selectOptionPopular = document.createElement("option");
                selectOptionPopular.textContent = "人気エントリー";
                selectOptionPopular.dataset["command"] = "Popular";
                selectOptionPopular.value = "";
                if (targetListName === "Popular") {
                    selectOptionPopular.selected = true;
                    targetListName = "";
                }
                selectBoxElem.appendChild(selectOptionPopular);
                var selectOptionRecent = document.createElement("option");
                selectOptionRecent.textContent = "新着エントリー";
                selectOptionRecent.dataset["command"] = "Recent";
                selectOptionRecent.value = "";
                if (targetListName === "Recent") {
                    selectOptionRecent.selected = true;
                    targetListName = "";
                }
                selectBoxElem.appendChild(selectOptionRecent);
                // セレクトボックスにエントリーのカテゴリーを追加
                var category2optionTag = function (categoryName, targetListName) {
                    var selectTag = document.createElement("option");
                    selectTag.value = categoryName;
                    selectTag.textContent = decodeURIComponent(categoryName);
                    if (categoryName === targetListName) {
                        selectTag.selected = true;
                    }
                    return selectTag;
                };
                for (var i = 0; i < categoryList.length; i++) {
                    selectBoxElem.appendChild(category2optionTag(categoryList[i], targetListName));
                }
                return selectBoxElem;
            })();
            awaseteControl.appendChild(awaseteSelectBox);
            // 再読み込みボタン
            var formBtnReload = document.createElement("button");
            formBtnReload.className = "js-htnpsne-awasete-btn-reload";
            formBtnReload.dataset["targetId"] = targetID;
            formBtnReload.innerHTML = "<i class=\"blogicon-repeat\"></i><span></span>";
            awaseteControl.appendChild(formBtnReload);
            // もっと読むボタン
            if (targetDiv.dataset.moreBtn === "true") {
                var formBtnReadmore = document.createElement("button");
                formBtnReadmore.className = "js-htnpsne-awasete-btn-readmore";
                formBtnReadmore.dataset["targetId"] = targetID;
                formBtnReadmore.innerHTML = "<i class=\"blogicon-list\"></i><span></span>";
                awaseteControl.appendChild(formBtnReadmore);
            }
            // 購読するボタン
            if (targetDiv.dataset.subscribeBtn === "true") {
                var formBtnSubscribe = document.createElement("button");
                formBtnSubscribe.className = "js-htnpsne-awasete-btn-subscribe";
                formBtnSubscribe.dataset["targetId"] = targetID;
                formBtnSubscribe.innerHTML = "<i class=\"blogicon-subscribe\"></i><span></span>";
                awaseteControl.appendChild(formBtnSubscribe);
            }
            // 結果表示領域
            var awaseteEntrys = (function () {
                var entrysElem = document.createElement("div");
                entrysElem.className = "js-htnpsne-awasete-entrys";
                entrysElem.dataset["targetId"] = targetID;
                // TODO:型変換する
                entrysElem.dataset["count"] = Math.abs(targetDiv.dataset.count * 1);
                entrysElem.textContent = " :) ";
                if (typeof (targetDiv.dataset.trackParameters) !== "undefined") {
                    entrysElem.dataset["trackParameters"] = targetDiv.dataset.trackParameters;
                }
                if (typeof (targetDiv.dataset.listType) !== "undefined") {
                    entrysElem.dataset["listType"] = targetDiv.dataset.listType;
                }
                if (typeof (targetDiv.dataset.displayBookmark_count) !== "undefined") {
                    entrysElem.dataset["displayBookmark_count"] = targetDiv.dataset.displayBookmark_count;
                }
                return entrysElem;
            })();
            moduleInner.appendChild(moduleControlPanel);
            moduleInner.appendChild(awaseteEntrys);
            moduleOuter.appendChild(moduleInner);
            targetDiv.appendChild(moduleOuter);
        }
        function setupEventListener() {
            // TODO:getElementsByClassName に置き換え
            var target = document.querySelectorAll(".js-htnpsne-awasete-select");
            var _loop_2 = function (i) {
                var targetElem = target[i];
                if (targetElem.dataset["listen"] !== "true") {
                    targetElem.dataset["listen"] = "true";
                    targetElem.addEventListener("change", function () {
                        var targetID = targetElem.dataset["targetId"];
                        if (targetElem.value !== "") {
                            // カテゴリ選択
                            getRSS(targetID, blogsUriBase + rssPath + targetElem.value);
                        }
                        else {
                            // 新着 もしくは人気
                            var targetSelect = document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                            if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                                // 人気記事
                                getHatebu(targetID, blogsUriBase);
                            }
                            else {
                                // 新着記事
                                getRSS(targetID, blogsUriBase + "/rss");
                            }
                        }
                    }, false);
                }
            };
            for (var i = 0; i < target.length; i++) {
                _loop_2(i);
            }
            // カテゴリ一覧を表示
            // TODO:getElementsByClassName に置き換え
            target = document.querySelectorAll(".js-htnpsne-awasete-btn-reload");
            var _loop_3 = function (i) {
                var targetElem = target[i];
                if (targetElem.dataset["listen"] !== "true") {
                    targetElem.dataset["listen"] = "true";
                    targetElem.addEventListener("click", function () {
                        // ボタンのtargetIDからセレクトボックスを指定する
                        var targetID = targetElem.dataset["targetId"];
                        var targetSelect = document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                        if (targetSelect.value !== "") {
                            getRSS(targetID, blogsUriBase + rssPath + targetSelect.value);
                        }
                        else {
                            // 新着 もしくは人気
                            if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                                // 人気記事
                                getHatebu(targetID, blogsUriBase);
                            }
                            else {
                                // 新着記事
                                getRSS(targetID, blogsUriBase + "/rss");
                            }
                        }
                    }, false);
                }
            };
            for (var i = 0; i < target.length; i++) {
                _loop_3(i);
            }
            // カテゴリ一覧を表示
            target = document.querySelectorAll(".js-htnpsne-awasete-btn-readmore");
            var _loop_4 = function (i) {
                var targetElem = target[i];
                if (targetElem.dataset["listen"] !== "true") {
                    targetElem.dataset["listen"] = "true";
                    targetElem.addEventListener("click", function () {
                        // ボタンのtargetIDからセレクトボックスを指定する
                        var targetID = targetElem.dataset["targetId"];
                        // console.log(document.querySelectorAll('select[data-target-id="' + targetID + '"]')[0].value);
                        var targetSelect = document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                        var openURL = "";
                        if (targetSelect.value !== "") {
                            openURL = blogsUriBase + categoryPath
                                + targetSelect.value;
                        }
                        else {
                            // 新着 もしくは人気
                            if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                                // 人気記事
                                openURL = "http://b.hatena.ne.jp/entrylist?sort=count&url="
                                    + encodeURIComponent(blogsUriBase);
                            }
                            else {
                                // 新着記事
                                openURL = blogsUriBase + "/archive";
                            }
                        }
                        openNewWindow(openURL);
                    }, false);
                }
            };
            for (var i = 0; i < target.length; i++) {
                _loop_4(i);
            }
            // カテゴリ一覧の購読
            target = document.querySelectorAll(".js-htnpsne-awasete-btn-subscribe");
            var _loop_5 = function (i) {
                var targetElem = target[i];
                if (targetElem.dataset["listen"] !== "true") {
                    targetElem.dataset["listen"] = "true";
                    targetElem.addEventListener("click", function () {
                        // ボタンのtargetIDからセレクトボックスを指定する
                        var targetID = targetElem.dataset["targetId"];
                        var targetSelect = document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                        var openURL = "";
                        if (targetSelect.value !== "") {
                            openURL = blogsUriBase + rssPath
                                + targetSelect.value;
                        }
                        else {
                            // 新着 もしくは人気
                            if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                                // 人気記事
                                openURL = "http://b.hatena.ne.jp/entrylist?sort=count&mode=rss&url="
                                    + encodeURIComponent(blogsUriBase);
                            }
                            else {
                                // 新着記事
                                openURL = blogsUriBase + "/feed";
                            }
                        }
                        openNewWindow(feedlyURL + encodeURIComponent(openURL));
                    }, false);
                }
            };
            for (var i = 0; i < target.length; i++) {
                _loop_5(i);
            }
        }
        function openNewWindow(url) {
            window.open(url);
        }
        /*
        * DOM生成完了時にスタート
        */
        if (document.readyState === "uninitialized" || document.readyState === "loading") {
            window.addEventListener("DOMContentLoaded", function () {
                setupModule();
            }, false);
        }
        else {
            setupModule();
        }
    })(Alsoread = Htnpsne.Alsoread || (Htnpsne.Alsoread = {}));
})(Htnpsne || (Htnpsne = {}));
