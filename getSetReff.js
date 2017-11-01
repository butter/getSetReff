function getSetReff()
{
    var _reff=[]; //settings
    var maxValues=7; //max referrer values
    var tempSReffCookie = tempPrevReffCookie = [];
    var tempReffCookie = resPrevReffCookie = sessionReferrer = "";
    var isNewSession = false;
    var UTM_PARAM_LABEL_MAP = {
        utm_campaign: 'c',
        utm_medium: 'm',
        utm_source: 's',
        utm_content: 'o',
        utm_term: 't',
    };

    var sessionTime = 1/24/60*30; //half an hour cookie

    if (_reff.length === 0) {
        _reff[0] = {'setDomain': document.location.hostname}
    };

    //get cookies
    var sReffCookie = typeof readCookie("__sreff") !== "undefined"
                          ? readCookie("__sreff")
                          : ""; // session cookie
    var prevReffCookie = typeof readCookie("__reff") !== "undefined"
                         ? readCookie("__reff").split('|').slice(1-maxValues).join('|')
                         : ""; // long term cookie

    function readCookie(name) {
        return (document.cookie.match('(^|; )'+name+'=([^;]*)') || 0)[2];
    }

    function setCookie(name, value, d) {
        dd = new Date();
        dd.setTime(dd.getTime() + (d*24*60*60*1000));
        expiration = typeof d !== "undefined" ? ";expires="+dd.toGMTString() : "";
        document.cookie = name+"="+value
                          +expiration
                          +";domain="+_reff[0].setDomain
                          +";path=/";
    }

    function getQueryParam(p) {
        if (document.location.search.indexOf(p) !== -1) {
            return (""+document.location.search.split(p+"=")[1]).split("&")[0];
        }
    }

    // get referrer and params
    if (getQueryParam("gclid")) {
        sessionReferrer += "r:[adwords]";
    } else if (document.referrer && document.referrer !== document.location.href) {
        sessionReferrer += "r:["+document.referrer.split('//')[1].split('/')[0]+"]";
    }

    Object.keys(UTM_PARAM_LABEL_MAP).forEach(function(key) {
        var utmParam = getQueryParam(key);
        if (utmParam) {
            sessionReferrer += UTM_PARAM_LABEL_MAP[key]+":["+utmParam+"]";
        }
    });

    // set session cookie
    if (sReffCookie) {
        tempSReffCookie = sReffCookie.split(".");
        tempSReffCookie[1] = new Date().getTime();
        tempSReffCookie[2]++;
    } else {
        tempSReffCookie[0] = tempSReffCookie[1] = new Date().getTime(); //start time = current time
        tempSReffCookie[2] = 1; //first pageview
        isNewSession = true;
    }
    sReffCookie = tempSReffCookie.join(".");
    setCookie("__sreff", sReffCookie, sessionTime);

    // set permanent cookie
    if (isNewSession) {
        resPrevReffCookie = (prevReffCookie !== "" ? prevReffCookie+"|" : "");
        setCookie("__reff", resPrevReffCookie+sessionReferrer+"&"+sReffCookie, 730);
    } else {
        tempPrevReffCookie = prevReffCookie.split("|");
        tempReffCookie = tempPrevReffCookie[tempPrevReffCookie.length-1];
        tempReffCookie = tempReffCookie.split("&")[0] !== "" ? tempReffCookie.split("&")[0] : sessionReferrer;
        resPrevReffCookie = (tempPrevReffCookie.length == 1 ? "" : (tempPrevReffCookie.slice(0, -1).join("|")+"|"));
        if (tempReffCookie.split("&")[0].indexOf(sessionReferrer) !== -1) {
            setCookie("__reff", resPrevReffCookie+tempReffCookie+"&"+sReffCookie, 730);
        } else {
            setCookie("__reff", prevReffCookie+"|"+sessionReferrer+"&"+sReffCookie, 730);
        }
    }

    return readCookie("__reff");
}
