/*
 * Htnpsne.API.ts for HatenaBlog CommonAPI (c) 2016,2017 Pocket Systems.
 * Released under the MIT license
 */
// ==ClosureCompiler==
// @output_file_name Htnpsne.API.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_wrapper (function() {%output%})();
// ==/ClosureCompiler==
/**
 * @preserve Htnpsne.API.ts v1.0.4 (c) 2017 Pocket Systems. | MIT | psn.hatenablog.jp
 * (「・ω・)「 Moment of the frame, in slow motion https://www.youtube.com/watch?v=HM63o4UlUPU
 */
namespace Htnpsne.API {
    "use strict";
    /**
     * はてなブログのHTMLタグに入るデータ属性 20170124更新
     */
    interface HatenaBlogTtmlTagDataset {
        /**
         * 管理者がアクセスするドメイン。"//blog.hatena.ne.jp"固定と考えて良い
         */
        adminDomain: string;
        /**
         * ブログオーナー。はてなIDが入る
         */
        author: string;
        /**
         * 利用言語。"ja en"
         */
        availLangs: string;
        /**
         * 初期ドメイン。例 "psn.hatenablog.jp" はてなブログMediaでは "example.hatenablog-oem.com" になる
         */
        blog: string;
        /**
         * (TODO)コメント順
         */
        blogCommentsTopIsNew: string;
        /**
         * ブログhost。初期ドメインと同じ値
         */
        blogHost: string;
        /**
         * ブログの公開状況(全体公開か)。noindexを付与していても、ログアウト状態で閲覧可能であれば "1" 限定公開の場合は ""
         */
        blogIsPublic: string;
        /**
         * ブログ名
         */
        blogName: string;
        /**
         * [独自ドメイン対応]ブログURL。 スキームと末尾の / が付く。 例 "http://blog.example.com/"
         */
        blogUri: string;
        /**
         * [独自ドメイン対応]ブログURL。 スキームが付くが末尾の / は付かない。 例 "http://blog.example.com"
         */
        blogsUriBase: string;
        /**
         * 基本的に "hatenablog"
         * はてなブログMedia利用時にカスタマイズされると固有の値になる。 Pro同等の場合 "regular_plan" など。
         * SSL/TLS化、サブディレクトリに設置など、柔軟なカスタマイズが可能な「はてなブログMedia」を どうぞご利用ください。
         * http://hatenablog.com/guide/media
         */
        brand: string;
        /**
         * 表示中のデバイスモード。 "pc" または "touch"
         */
        device: string;
        /**
         * グローバルヘッダの色
         */
        globalheaderColor: string;
        /**
         * グローバルヘッダのUI表示。 "pc" または "touch"
         */
        globalheaderType: string;
        /**
         * (TODO)(恐らくレスポンシブ表示の案内フラグ)
         */
        hasTouchView: string;
        /**
         * 
         */
        initialState: string;
        /**
         * ページフォーマット。"index" "entry"など
         * はてなブログMediaでは "page"(ブログ記事ではない カスタムページ)がある
         */
        page: string;
        /**
         * (TODO)Pro(というよりはてなダイアリーPlusのフラグのような気がする) "1" または ""
         */
        plusAvailable: string;
        /**
         * はてなブログPro フラグ "true" または "false"
         * はてなブログMediaでは "true" 固定(要検証)
         */
        pro: string;
        /**
         * はてなブログのCDNサーバー ドメイン "https://cdn.blog.st-hatena.com" (おそらく固定)
         */
        staticDomain: string;
        /**
         * はてなブログ デプロイID 42桁のハッシュ
         */
        version: string;
    }
    export const version: string = "1.0.4";
    let HeadTag: HTMLElement = document.getElementsByTagName("head")[0];
    let delayedFlg: any = { HatenaTime: false, GoogleAds: false };
    /**
     * HTMLに置かれているデータ属性へのショートカット
     */
    export let htmlTagData: HatenaBlogTtmlTagDataset = <any>document.getElementsByTagName("html")[0].dataset;
    if (typeof htmlTagData === "undefined") {
        console.log("if you'd like to use many of our latest and greatest features,"
            + " please upgrade to a modern, fully supported browser. :)");
    }

    /**
     * CSS の読み込み (linkタグの作成)
     * @param url
     */
    export function setupCSS(url: string): void {
        var elmCssTag: HTMLLinkElement = document.createElement("link");
        elmCssTag.href = url;
        elmCssTag.rel = "stylesheet";
        elmCssTag.type = "text/css";
        HeadTag.appendChild(elmCssTag);
    }

    /**
     * Google Adsense のスクリプトを読み込み、利用可能にする (scriptタグの作成)
     */
    function setupGoogAds(): void {
        let a: HTMLScriptElement = document.createElement("script");
        a.async = true;
        a.src = "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        let c: HTMLScriptElement = document.getElementsByTagName("script")[0];
        c.parentNode.insertBefore(a, c);
        delayedFlg.GoogleAds = true;
    }

    /**
     * アルゴリズム Fisher-Yatesでシャッフルする
     * @param arr リスト
     * @param option_randFunction Math.random以外で乱数を生成したい場合
     */
    export function listShuffle(arr: any[], option_randFunction?: any): any[] {
        let randFunc: any = option_randFunction || Math.random;
        arr = arr.slice(); // arrを複製して新しい配列のみシャッフルする
        for (let i: number = arr.length - 1; 0 < i; i--) {
            let j: number = Math.floor(randFunc() * (i + 1)), temp: any = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    /**
     * 文字列をエスケープするやつ
     * @param a 文字列
     */
    export function escapeHtml(a: string): string {
        return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    };

    /**
     * (WIP) Google AdSense 用HTMLタグを生成する
     * @param AdsData Google Adsのパラメータ
     * @param objectFlg 返却をHTMLで欲しい場合はfalseとする
     */
    interface GoogAdsData {
        client: string;
        slot: string;
        className?: string;
        style?: CSSStyleDeclaration; // (WIP) HTMLStyle
        format: string;

    }
    export function makeHtmlGoogAds(AdsData: GoogAdsData, objectFlg: boolean = true): any {
        // 必須項目のチェック data-ad-client
        if (typeof (AdsData.client) === "undefined" || AdsData.client === null || AdsData.client === "") {
            if (objectFlg) {
                let elmInsTag: HTMLElement = document.createElement("ins");
                return elmInsTag.setAttribute("data-ad-error", "error");
            } else {
                return;
            }
        }
        // 必須項目のチェック data-ad-slot
        if (typeof (AdsData.slot) === "undefined" || AdsData.slot == null || AdsData.slot === "") {
            if (objectFlg) {
                let elmInsTag: HTMLElement = document.createElement("ins");
                return elmInsTag.setAttribute("data-ad-error", "error");
            } else {
                return;
            }
        }
        // googAds追加スクリプトの読み込み
        if (!delayedFlg.GoogleAds) {
            setupGoogAds();
        }

        if (typeof (AdsData.className) === "undefined" || AdsData.className === null) {
            AdsData.className = "";
        }
        if (typeof (AdsData.style) === "undefined" || AdsData.style === null || AdsData.style === {}) {
            AdsData.style.display = "block";
        }
        if (typeof (AdsData.format) === "undefined" || AdsData.format === null) {
            AdsData.format = "auto";
        }
        var elmInsTag: HTMLElement = document.createElement("ins");
        elmInsTag.className = "adsbygoogle " + AdsData.className;
        elmInsTag.setAttribute("data-ad-client", AdsData.client);
        elmInsTag.setAttribute("data-ad-slot", AdsData.slot);
        elmInsTag.setAttribute("data-ad-format", AdsData.format);
        Object.keys(AdsData.style).map(key => elmInsTag.style[key] = AdsData.style[key]);
        if (objectFlg === false) {
            return elmInsTag.outerHTML;
        }
        return elmInsTag;
    }

    /**
     * はてなブログ ユーザーアイコンのURLを取得する
     * @param username ユーザーID(英数字。省略時は自分自身「my」)
     * @param size アイコンサイズ(省略可)
     */
    export function hatenaProfileIconURL(username: string = "my", size?: number): string {
        // http://n.hatena.ne.jp/my/profile/image?size=16&type=icon
        // 一般的には
        // "http://cdn1.www.st-hatena.com/users/" + username.substr( 0, 2 ) + "/" + username + "/profile.gif"
        // という呼び出し方をしているようです。TLSで取得したい場合は、
        // "https://www.hatena.ne.jp/users/" + username.substr( 0, 2 ) + "/" + username + "/profile.gif"
        // このように取得します。
        // はてなブログ内であれば、Hatena.User.getProfileIcon(userid) を利用すればHTMLタグとして取得できます。 2016/03/21
        if (size) {
            return "http://n.hatena.ne.jp/" + username + "/profile/image?type=icon" + "&size=" + size;
        } else {
            return "http://n.hatena.ne.jp/" + username + "/profile/image?type=icon";
        }
    }

    /**
     * はてなブログ カテゴリーが記事に設定されているかチェックする
     * @param categoryName カテゴリー名
     */
    export function hasCategory(categoryName: string = ""): boolean {
        // はてなブログでは カテゴリ名に空白(全半角)がある場合はハイフンに変わります。
        // "foo bar"→"foo-bar" "foo　bar"→"foo-bar"
        categoryName = categoryName.replace(/\s/g, "-");
        if (document.getElementsByTagName("html")[0].getAttribute("data-page") !== "entry" || categoryName === "") { return false; }
        return (document.getElementsByTagName("body")[0].className).split(" ").indexOf("category-" + categoryName) >= 0;
    }



}
