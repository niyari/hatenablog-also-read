/// <reference path="also-read.header.ts" />
/// <reference path="htnpsne.api.ts" />
/* tslint:disable:no-string-literal */

namespace Htnpsne.Alsoread {
    "use strict";
    let blogsUriBase: string = Htnpsne.API.htmlTagData.blogsUriBase;
    // let blogBase: string = Htnpsne.API.htmlTagData.blog;
    let categoryPath: string = "/archive/category/";
    let rssPath: string = "/rss/category/";
    let loadCSS: boolean = true;
    let categoryList: string[] = [];
    let feedlyURL: string = "http://cloud.feedly.com/#subscription%2Ffeed%2F";
    let externalCSS: string = "//niyari.github.io/hatenablog-modules/css/also-read.min.css";
    let defaultModuleTitle: string = "あわせて読みたい";
    let disableModuleExecuteTest: boolean = false;

    // カテゴリリスト取得
    function getCategoryList(): string[] {
        let list: string[] = [];
        let targetDomain: string = blogsUriBase.split("://")[1];
        // "body.page-entry div.categories a" のみで良い/スマホ版の「記事下のカテゴリ表示」に対応
        let selector: string = "body.page-entry div.categories a";
        let entryCategoryList: NodeList = document.querySelectorAll(selector);
        for (let i: number = 0; i < entryCategoryList.length; i++) {
            let listAnchor: HTMLAnchorElement = <HTMLAnchorElement>entryCategoryList[i];
            let listAnchorHref: string = listAnchor.href.split(targetDomain + categoryPath)[1];
            if (typeof (listAnchor) !== "undefined") { list.push(listAnchorHref); };
        }
        return list;
    }

    // RSS受信
    function getRSS(targetID: string, url: string): void {
        let list: any = [];
        $.ajax({
            dataType: "xml",
            url: url
        }).done(function (data: any, status: any, xhr: any): void {
            // RSSリスト整形
            $(data).find("item").each(function (): void {
                if (/^\/entry/.test(location.pathname) === false || location.origin + location.pathname !== $(this).find("link").text()) {
                    // /^\/entry/.test(location.pathname) は、記事ページではない場合の計算コストを考慮する為に書いた(要検証)
                    list.push({
                        "title": $(this).find("title").text(),
                        "link": $(this).find("link").text()
                    });
                }
            });
            insertEntryList(targetID, list);
        }).fail(function (xhr: any, status: any, error: any): void {
            // 通信失敗
            insertEntryList(targetID, [{
                "title": "(取得できませんでした。再読み込みを行ってください)",
                "link": blogsUriBase
            }]);
        });
    }

    // はてなブックマーク(JSONP)受信
    function getHatebu(targetID: string, url: string): void {
        let list: any = [];
        $.ajax({
            dataType: "jsonp",
            url: "http://b.hatena.ne.jp/entrylist/json",
            data: {
                "sort": "count",
                "url": url
            }
        }).done(function (data: any, status: any, xhr: any): void {
            for (let i: number = 0; i < data.length; i++) {
                if (/\/entry\//.test(data[i].link) === true && // エントリーページのみ(簡易判定)
                    location.origin + location.pathname !== data[i].link) {
                    list.push({
                        "title": data[i].title,
                        "count": data[i].count,
                        "link": data[i].link
                    });
                } else {
                    console.log("対象のページを除外しました。(B!)");
                }
            }
            insertEntryList(targetID, list);
        }).fail(function (xhr: any, status: any, error: any): void {
            // 通信失敗
            insertEntryList(targetID, [{
                "title": "(取得できませんでした。再読み込みを行ってください)",
                "link": blogsUriBase
            }]);
        });
    }

    // 初期処理
    function setupModule(): void {
        categoryList = getCategoryList();
        let target: NodeList = document.querySelectorAll(".js-htnpsne-awasete-module");

        for (let i: number = 0; i < target.length; i++) {
            let targetElem: HTMLElement = <HTMLElement>target[i];

            if (targetElem.dataset["userCss"] === "true") { loadCSS = false; }
            if (targetElem.dataset["disableModuleExecuteTest"] === "true") { disableModuleExecuteTest = true; }

            let mode: string = targetElem.dataset["mode"];
            // カテゴリーが設定されていない事がある　ランダムでも良いかもしれない
            if (categoryList.length === 0) {
                mode = Htnpsne.API.listShuffle(["Recent", "Popular"])[0];
            } else {
                categoryList = Htnpsne.API.listShuffle(categoryList);
            }
            if (mode === "Popular") {
                createModuleBody(targetElem, Math.random().toString(36).slice(6), "Popular");
                getHatebu(targetElem.dataset["targetId"], blogsUriBase);
            } else if (mode === "Recent") {
                createModuleBody(targetElem, Math.random().toString(36).slice(6), "Recent");
                getRSS(targetElem.dataset["targetId"], blogsUriBase + "/rss");
            } else {
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
        if (Htnpsne.API.htmlTagData.page === "about" && disableModuleExecuteTest === true) {
            // 描画用コードの動作確認
            moduleExecuteTest();
        };

    }

    // 描画用コードの動作確認
    function moduleExecuteTest(): void {
        let elm_aboutContent: any, elm_div: HTMLElement;
        if (document.getElementById("Htnpsne-about-elem") == null) {
            if (document.querySelector(".about-subscription-count") != null) {
                // 最後から2番目に追加
                elm_aboutContent = document.querySelectorAll("div.entry-content dt");
                elm_aboutContent = elm_aboutContent[elm_aboutContent.length - 1];
                elm_div = document.createElement("dt");
                elm_div.innerText = "ブログ拡張機能";
                elm_aboutContent.parentNode.insertBefore(elm_div, elm_aboutContent);
                elm_div = document.createElement("dd");
                elm_div.id = "Htnpsne-about-elem";
                elm_aboutContent.parentNode.insertBefore(elm_div, elm_aboutContent);
            } else {
                // 最後に追加
                elm_aboutContent = document.querySelectorAll("div.entry-content dd");
                if (elm_aboutContent.length === 0) {
                    // aboutページのコンテンツが空なのでdivを入れる
                    elm_div = document.createElement("div");
                    elm_aboutContent = document.querySelector("div.entry-content");
                    elm_aboutContent.appendChild(elm_div);
                    elm_aboutContent = elm_div;
                } else {
                    elm_aboutContent = elm_aboutContent[elm_aboutContent.length - 1];
                }
                elm_div = document.createElement("dt");
                elm_div.textContent = "ブログ拡張機能";
                elm_aboutContent.parentNode.appendChild(elm_div);
                elm_div = document.createElement("dd");
                elm_div.id = "Htnpsne-about-elem";
                elm_aboutContent.parentNode.appendChild(elm_div);
            }
        }
        elm_aboutContent = document.getElementById("Htnpsne-about-elem");
        elm_div = document.createElement("div");
        elm_div.innerHTML = "<a href=\"http://psn.hatenablog.jp/entry/also-read\" target=\"_blank\">Also read(はてなブログ あわせて読みたい) を利用中です。</a>";
        elm_aboutContent.appendChild(elm_div);
    }

    // CSSをリンクする
    function setupCSS(url: string): void {
        let elmSideMenuCSS: HTMLLinkElement = document.createElement("link");
        elmSideMenuCSS.href = url;
        elmSideMenuCSS.rel = "stylesheet";
        elmSideMenuCSS.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(elmSideMenuCSS);
    }

    // リスト生成
    function insertEntryList(targetID: string, list: any): void {
        let targetDiv: HTMLElement = <HTMLElement>document.querySelector(".js-htnpsne-awasete-entrys[data-target-id=\"" + targetID + "\"]");
        let count: number = parseInt(targetDiv.dataset["count"], 10);
        let trackParameters: string = typeof (targetDiv.dataset["trackParameters"]) === "undefined"
            ? "" : targetDiv.dataset["trackParameters"];
        let listType: string = typeof (targetDiv.dataset["listType"]) === "undefined" ? "" : targetDiv.dataset["listType"];
        // displayBookmark_countは「true/false」が入っているが、後の扱いの為にboolではなくstringとする
        let displayBookmark_count: string = typeof (targetDiv.dataset["displayBookmark_count"]) === "undefined"
            ? "false" : targetDiv.dataset["displayBookmark_count"];
        targetDiv.innerHTML = "";
        if (list.length === 0) {
            list = [{
                "link": blogsUriBase,
                "title": "ブログTOPへ"
            }];
        }
        list = Htnpsne.API.listShuffle(list);
        if (count > list.length) {
            count = list.length;
        } else if (count === 0) {
            count = 3;
        }
        // TODO:はてなブログのブログパーツ経由で表示させているが、オリジナルのHTMLを出力が必要か(要望があるか)確認する
        // その際、はてブの一覧ので画像表示にコストが掛かるため、実装の前にどうにかする必要がある
        if (listType === "list") {
            let elem: HTMLUListElement = document.createElement("ul");
            for (let i: number = 0; i < count; i++) {
                let listElem: HTMLLIElement = document.createElement("li");
                let listElemAnchor: HTMLAnchorElement = document.createElement("a");
                listElemAnchor.href = list[i].link + trackParameters;
                listElemAnchor.textContent = list[i].title;
                if (displayBookmark_count === "true") {
                    listElemAnchor.appendChild((function (): HTMLImageElement {
                        let listImageElem: HTMLImageElement = document.createElement("img");
                        listImageElem.src = "http://b.st-hatena.com/entry/image/" + list[i].link;
                        listImageElem.className = "bookmark-count";
                        listImageElem.alt = "Hatena Bookmark - " + listElemAnchor.textContent;
                        return listImageElem;
                    })());
                }
                listElem.appendChild(listElemAnchor);
                elem.appendChild(listElem);
            }
            targetDiv.appendChild(elem);
        } else {
            // iframe
            // iframe版はdisplayBookmark_countはtrue扱いとなる
            for (let i: number = 0; i < count; i++) {
                let elem: HTMLIFrameElement = document.createElement("iframe");
                // 新設class js-htnpsne-awasete-embed-blogcard / width:"100%" display:"block"
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

    function createModuleBody(targetDiv: any, targetID: string, targetListName: string): void {
        let moduleOuter: HTMLDivElement = document.createElement("div");
        moduleOuter.dataset["targetId"] = targetID;
        targetDiv.dataset.targetId = targetID;

        let displayModuleTitle: string = typeof (targetDiv.dataset.title) === "undefined" || targetDiv.dataset.title === "" ?
            defaultModuleTitle : targetDiv.dataset.title;

        let moduleInner: HTMLElement = document.createElement("aside");
        let moduleControlPanel: HTMLHeadingElement = document.createElement("h1");
        moduleControlPanel.className = "js-htnpsne-awasete-control-outer";
        // タイトル
        moduleControlPanel.appendChild(((): HTMLSpanElement => {
            let awaseteTitle: HTMLSpanElement = document.createElement("span");
            awaseteTitle.className = "js-htnpsne-awasete-title";
            awaseteTitle.textContent = displayModuleTitle;
            return awaseteTitle;
        })());

        // 操作領域
        let awaseteControl: HTMLSpanElement = ((): HTMLSpanElement => {
            let controlElem: HTMLSpanElement = document.createElement("span");
            controlElem.className = "js-htnpsne-awasete-control";
            let alsoReadLink: HTMLAnchorElement = document.createElement("a");
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
        let awaseteSelectBox: HTMLSelectElement = ((): HTMLSelectElement => {
            let selectBoxElem: HTMLSelectElement = document.createElement("select");
            selectBoxElem.className = "js-htnpsne-awasete-select";
            selectBoxElem.dataset["targetId"] = targetID;
            // セレクトボックスの中身を作成
            let selectOptionPopular: HTMLOptionElement = document.createElement("option");
            selectOptionPopular.textContent = "人気エントリー";
            selectOptionPopular.dataset["command"] = "Popular";
            selectOptionPopular.value = "";
            if (targetListName === "Popular") {
                selectOptionPopular.selected = true;
                targetListName = "";
            }
            selectBoxElem.appendChild(selectOptionPopular);

            let selectOptionRecent: HTMLOptionElement = document.createElement("option");
            selectOptionRecent.textContent = "新着エントリー";
            selectOptionRecent.dataset["command"] = "Recent";
            selectOptionRecent.value = "";
            if (targetListName === "Recent") {
                selectOptionRecent.selected = true;
                targetListName = "";
            }
            selectBoxElem.appendChild(selectOptionRecent);
            // セレクトボックスにエントリーのカテゴリーを追加
            let category2optionTag: any = function (categoryName: string, targetListName: string): HTMLOptionElement {
                let selectTag: HTMLOptionElement = document.createElement("option");
                selectTag.value = categoryName;
                selectTag.textContent = decodeURIComponent(categoryName);
                if (categoryName === targetListName) {
                    selectTag.selected = true;
                }
                return selectTag;
            };
            for (let i: number = 0; i < categoryList.length; i++) {
                selectBoxElem.appendChild(category2optionTag(categoryList[i], targetListName));

            }
            return selectBoxElem;
        })();
        awaseteControl.appendChild(awaseteSelectBox);
        // 再読み込みボタン
        let formBtnReload: HTMLButtonElement = document.createElement("button");
        formBtnReload.className = "js-htnpsne-awasete-btn-reload";
        formBtnReload.dataset["targetId"] = targetID;
        formBtnReload.innerHTML = "<i class=\"blogicon-repeat\"></i><span></span>";
        awaseteControl.appendChild(formBtnReload);
        // もっと読むボタン
        if (targetDiv.dataset.moreBtn === "true") {
            let formBtnReadmore: HTMLButtonElement = document.createElement("button");
            formBtnReadmore.className = "js-htnpsne-awasete-btn-readmore";
            formBtnReadmore.dataset["targetId"] = targetID;
            formBtnReadmore.innerHTML = "<i class=\"blogicon-list\"></i><span></span>";
            awaseteControl.appendChild(formBtnReadmore);
        }
        // 購読するボタン
        if (targetDiv.dataset.subscribeBtn === "true") {
            let formBtnSubscribe: HTMLButtonElement = document.createElement("button");
            formBtnSubscribe.className = "js-htnpsne-awasete-btn-subscribe";
            formBtnSubscribe.dataset["targetId"] = targetID;
            formBtnSubscribe.innerHTML = "<i class=\"blogicon-subscribe\"></i><span></span>";
            awaseteControl.appendChild(formBtnSubscribe);
        }

        // 結果表示領域
        let awaseteEntrys: HTMLDivElement = ((): HTMLDivElement => {
            let entrysElem: HTMLDivElement = document.createElement("div");
            entrysElem.className = "js-htnpsne-awasete-entrys";
            entrysElem.dataset["targetId"] = targetID;
            // TODO:型変換する
            entrysElem.dataset["count"] = <any>Math.abs(targetDiv.dataset.count * 1);
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

    function setupEventListener(): void {
        // TODO:getElementsByClassName に置き換え
        let target: HTMLSelectElement = <HTMLSelectElement>document.querySelectorAll(".js-htnpsne-awasete-select");
        for (let i: number = 0; i < target.length; i++) {
            let targetElem: HTMLSelectElement = target[i];
            if (targetElem.dataset["listen"] !== "true") {
                targetElem.dataset["listen"] = "true";
                targetElem.addEventListener("change", function (): void {
                    let targetID: string = targetElem.dataset["targetId"];
                    if (targetElem.value !== "") {
                        // カテゴリ選択
                        getRSS(targetID, blogsUriBase + rssPath + targetElem.value);
                    } else {
                        // 新着 もしくは人気
                        let targetSelect: HTMLSelectElement =
                            <HTMLSelectElement>document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                        if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                            // 人気記事
                            getHatebu(targetID, blogsUriBase);
                        } else {
                            // 新着記事
                            getRSS(targetID, blogsUriBase + "/rss");
                        }
                    }
                }, false);
            }
        }


        // カテゴリ一覧を表示
        // TODO:getElementsByClassName に置き換え
        target = <HTMLSelectElement>document.querySelectorAll(".js-htnpsne-awasete-btn-reload");
        for (let i: number = 0; i < target.length; i++) {
            let targetElem: HTMLSelectElement = target[i];
            if (targetElem.dataset["listen"] !== "true") {
                targetElem.dataset["listen"] = "true";
                targetElem.addEventListener("click", function (): void {

                    // ボタンのtargetIDからセレクトボックスを指定する
                    let targetID: string = targetElem.dataset["targetId"];
                    let targetSelect: HTMLSelectElement =
                        <HTMLSelectElement>document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                    if (targetSelect.value !== "") {
                        getRSS(targetID, blogsUriBase + rssPath + targetSelect.value);
                    } else {
                        // 新着 もしくは人気
                        if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                            // 人気記事
                            getHatebu(targetID, blogsUriBase);
                        } else {
                            // 新着記事
                            getRSS(targetID, blogsUriBase + "/rss");
                        }
                    }

                }, false);
            }
        }



        // カテゴリ一覧を表示
        target = <HTMLSelectElement>document.querySelectorAll(".js-htnpsne-awasete-btn-readmore");
        for (let i: number = 0; i < target.length; i++) {
            let targetElem: HTMLSelectElement = target[i];
            if (targetElem.dataset["listen"] !== "true") {
                targetElem.dataset["listen"] = "true";
                targetElem.addEventListener("click", function (): void {

                    // ボタンのtargetIDからセレクトボックスを指定する
                    let targetID: string = targetElem.dataset["targetId"];
                    // console.log(document.querySelectorAll('select[data-target-id="' + targetID + '"]')[0].value);

                    let targetSelect: HTMLSelectElement =
                        <HTMLSelectElement>document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                    let openURL: string = "";
                    if (targetSelect.value !== "") {
                        openURL = blogsUriBase + categoryPath
                            + targetSelect.value;
                    } else {
                        // 新着 もしくは人気
                        if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                            // 人気記事
                            openURL = "http://b.hatena.ne.jp/entrylist?sort=count&url="
                                + encodeURIComponent(blogsUriBase);
                        } else {
                            // 新着記事
                            openURL = blogsUriBase + "/archive";
                        }
                    }
                    openNewWindow(openURL);

                }, false);
            }
        }

        // カテゴリ一覧の購読
        target = <HTMLSelectElement>document.querySelectorAll(".js-htnpsne-awasete-btn-subscribe");
        for (let i: number = 0; i < target.length; i++) {
            let targetElem: HTMLSelectElement = target[i];
            if (targetElem.dataset["listen"] !== "true") {
                targetElem.dataset["listen"] = "true";
                targetElem.addEventListener("click", function (): void {

                    // ボタンのtargetIDからセレクトボックスを指定する
                    let targetID: string = targetElem.dataset["targetId"];
                    let targetSelect: HTMLSelectElement =
                        <HTMLSelectElement>document.querySelector("select[data-target-id=\"" + targetID + "\"]");
                    let openURL: string = "";
                    if (targetSelect.value !== "") {
                        openURL = blogsUriBase + rssPath
                            + targetSelect.value;
                    } else {
                        // 新着 もしくは人気
                        if (targetSelect[targetSelect.selectedIndex].dataset.command === "Popular") {
                            // 人気記事
                            openURL = "http://b.hatena.ne.jp/entrylist?sort=count&mode=rss&url="
                                + encodeURIComponent(blogsUriBase);
                        } else {
                            // 新着記事
                            openURL = blogsUriBase + "/feed";
                        }
                    }
                    openNewWindow(feedlyURL + encodeURIComponent(openURL));

                }, false);
            }
        }

    }

    function openNewWindow(url: string): void {
        window.open(url);
    }
    // DOM生成完了時にスタート
    if (document.readyState === "uninitialized" || document.readyState === "loading") {
        // memo IE10 以下ではdocument.readyState === "interactive" で判定できるが、datasetが使えないので考慮しない
        window.addEventListener("DOMContentLoaded", function (): void {
            setupModule();
        }, false);
    } else {
        setupModule();
    }
}