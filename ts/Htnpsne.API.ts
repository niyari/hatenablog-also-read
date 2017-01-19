/*
部分データ 170116
*/
namespace Htnpsne.API {
    "use strict";
    //TODO
    /* tslint:disable */
    let HeadTag: HTMLElement = document.getElementsByTagName("head")[0];
    let delayedFlg: any = { HatenaTime: false, GoogleAds: false };
    export const version: string = "1.0.2";
    export let htmlTagData: any = document.getElementsByTagName("html")[0].dataset;
}