// Copyright 2006-2020 ClickTale Ltd., US Patent Pending

window.ClickTaleGlobal=window.ClickTaleGlobal||{},ClickTaleGlobal.init=window.ClickTaleGlobal.init||{},function(){function t(){this.started=!1,this.stopCallbacks=[],this.readyCallbacks=[],this.startCallbacks=[],this.xhrCreatedCallback=function(){},this.shouldStartMonitorCallback=function(){}}function n(t){return!!t&&t.constructor.prototype===Object.prototype}t.onReady=function(o,i){var a=t.get(),e=a.shouldStartMonitorCallback();if(void 0===e||!1!==e){var r=a.readyCallbacks,c=r.length;a.diagnose("onready");for(var l=0;l<c;l++)r[l]();if(!a.started){var s,d=a.config,u=n(o),f=function(t){a.started=!0,a.addApplication(t),a.startCallbacks.forEach(function(t){t()})};u&&(o.onStartCallback=f,(s=n(i))?d=i:s=!!d),new ClickTaleMonitor.App(136,u?o:f,s?d:o,s?void 0:i).onStop(function(n){a&&(a.stopCallbacks.forEach(function(t){t()}),t.instance=void 0)})}}else t.instance=void 0};var o=t.prototype;if(o.addApplication=function(t){this.monitor=t},o.configure=function(t){this.config=function t(o,i){for(var a in i=i||{},o){var e=o[a];e instanceof Array?i[a]=e.slice():n(e)?i[a]=t(e,i[a]):i[a]=e}return i}(t,this.config)},o.onStart=function(t){this.monitor&&this.monitor.isMonitoring()?t():this.startCallbacks.push(t)},o.onStop=function(t){this.stopCallbacks.push(t)},o.onReady=function(t){this.readyCallbacks.push(t)},o.onXhrCreated=function(t){this.xhrCreatedCallback=t},o.shouldStartMonitor=function(t){this.shouldStartMonitorCallback=t},o.diagnose=function(t){var n=ClickTaleGlobal.diagnostics,o=n&&n.invoke;if("function"==typeof o)o(n.monitor,t);else{var i=n&&n.monitor,a=i&&i[t];"function"==typeof a&&a()}},t.get=function(){return t.instance||(t.instance=new t)},Object.defineProperty)try{Object.defineProperty(t,"config",{get:function(){return t.instance?t.instance.config:null},enumerable:!0,configurable:!0})}catch(t){}function i(n,o){var i=t.instance;if(i&&i.monitor)return i.monitor[n].apply(i.monitor,o)}var a={stop:function(){i("dispose")},restart:function(t,n){i("restart",[t,n])},shutdown:function(){i("shutdown")},addEvent:function(t){i("addEvent",[t])},addPageTag:function(t,n,o){i("addPageTag",[t,3,o||n])},ctData:function(t){i("ctData",[t])},addDynamicAction:function(t,n){i("addPageTag",[t,4,n])},isMonitoring:function(){return!!i("isMonitoring")},getPid:function(){return 136},getState:function(){return t.get().started?i("getState"):"pending"},endVisit:function(){i("endVisit")},Settings:t},e=window.ClickTaleMonitor||{};for(var r in a)e[r]=a[r];window.ClickTaleMonitor=e}(),ClickTaleGlobal.init.pmc=function(t){var n=ClickTaleGlobal.init.monitorScriptName;var o,i,a,e,r,c=window.ClickTaleScriptSource+n.toLowerCase();ClickTaleMonitor.Settings.get().configure(t),n&&(o=c,e=ClickTaleGlobal.scripts,r=ClickTaleMonitor.Settings.get(),onloaded=function(){i.onreadystatechange=i.onload=null,r.diagnose("onloaded")},(a=document.body||document.head)&&((i=function(t){if(document.documentElement.namespaceURI)try{return document.createElementNS("http://www.w3.org/1999/xhtml",t)}catch(t){}return document.createElement(t)}("script")).onreadystatechange=function(){"loaded"===i.readyState&&onloaded()},i.onload=onloaded,i.async=!0,i.type="text/javascript",i.crossOrigin="anonymous",e.sri&&e.sri.hashes?(i.integrity=e.sri.hashes.monitor,i.src=e.sri.path+"monitor.js"):i.src=o,r.diagnose("onloading"),a.appendChild(i)))};

window.ClickTaleGlobal = window.ClickTaleGlobal || {};
window.ClickTaleSettings = window.ClickTaleSettings || {};

ClickTaleGlobal.init = ClickTaleGlobal.init || {};
ClickTaleGlobal.scripts = ClickTaleGlobal.scripts || {};
ClickTaleGlobal.scripts.versions = {"wr": "WR-latest.js", "pcc": "9ab8166d-8a74-4f5b-8b6f-42c1717e3004.js?DeploymentConfigName=Release_20171101&Version=12", "monitor": "Monitor-latest.js"};
(function (d) {
	var dom="",
		spe=[92,94,36,46,124,63,42,43,40,41,91,123],
		rep=[98,100,102,104,106,108,110,112,114,116,118,119];
	for(var v,c,i=0,len=d.length;i<len,c=d.charCodeAt(i);i++){		
		if(c>=97&c<=122){v=c+7;v=v>122?v-26:v;v=v%2==0?v-32:v;}
		else if(c>=48&c<=57){v=69+(c-48)*2}
		else if(c==45){v=65}
		else if(spe.indexOf(c)>=0){v=rep[spe.indexOf(c)]}
		else{v=c}
		dom+=String.fromCharCode(v);
	}

	ClickTaleGlobal.init.isAllowed = (function() {
						return false;
					})()
})(window.location.host.toLowerCase().replace(/^((www)?\.)/i, ""));

	var autoMonitorConfig;
	ClickTaleGlobal.diagnostics=function(){function n(n,t,o){if(n&&t)for(var r in T){var e=T[r];e.collect(t)&&e.errors.push({message:n,url:t,lineno:o})}return!!S&&S(n,t,o)}function t(n){return"function"==typeof n}function o(){return performance?performance.now():Date.now()}function r(n){++n.sampled>n.repeats?g(n.name):e(n)}function e(n){var t=n.reporter()||{},o=n.errors.splice(0),r=n.level,e=n.url,l={loaded:n.loaded,ready:n.ready,started:n.started,level:o.length?"error":r,errors:encodeURIComponent(JSON.stringify(o))};e&&r!==k&&(n.timeToLoad>0&&(l.timeToLoad=n.timeToLoad),a(n,i(i(e+"?t=log&p="+n.pid,l),t),o))}function i(n,t){for(var o in t)n+="&"+I[o]+"="+t[o];return n}function a(n,o,r){var e=L.sendBeacon,i=function(n){n.errors=r.concat(n.errors)};if(t(e))e.call(L,o)||i(n);else{var a=new Image;a.onerror=a.ontimeout=function(){i(n)},a.timeout=3e4,a.src=o}}function l(n){T[n]&&(T[n].ready=!0)}function c(n){var t=T[n];t&&(t.loaded=!0,t.timeToLoad=t.loadStart?o()-t.loadStart:0),T[n]=t}function d(n){T[n]&&(T[n].loading=!0,T[n].loadStart=o())}function u(n){T[n]&&(T[n].started=!0)}function f(n){T[n]&&(T[n].starting=!0)}function s(n,o,r){var e=window.ClickTaleMonitor;e&&(I.monitorState=40,I.isMonitoring=42,t(e.getPid)&&v(M,e.getPid(),n||"https://conductor.clicktale.net/monitor",/\/monitor-(latest|[\d\.]+).*\.js$/i,function(){var n=t(e.getState)&&e.getState();return!this.errors.length&&n.match(/^(chunk|end)$/i)&&(this.level=k),{monitorState:n,isMonitoring:t(e.isMonitoring)&&e.isMonitoring()}},o||5e3,r||1))}function m(){g(M)}function v(t,o,r,e,i,a,l){T[t]=T[t]||new p(t,o,r,e,i,a,l),y||(S=window.onerror,window.onerror=n,y=!0)}function g(n){var t=T[n];t&&(clearInterval(t.sampler),delete T[n]);for(var o in T)return;y=!1}function p(n,t,o,e,i,a,l){var c=this;c.url=o,c.pid=t,c.errors=[],c.name=n,c.level="alert",c.repeats=l,c.loadStart=c.sampled=c.timeToLoad=0,c.loading=c.loaded=c.starting=c.started=c.ready=!1,c.reporter=function(){return i.call(c)},c.collect=function(n){return!!n.match(e)},c.sampler=setInterval(function(){r(c)},a)}function h(n,t,o){var r=n&&n.name,e=T[r];if(e){var i=e[t];"function"==typeof i&&i.apply(this,o)}}function w(n,t,o){return{on:t,off:o,onready:function(){l(n)},onloaded:function(){c(n)},onloading:function(){d(n)},onstarted:function(){u(n)},onstarting:function(){f(n)}}}var y,S,T={},L=navigator,k="info",M="monitor",I={level:0,loaded:2,ready:4,started:6,errors:8,timeToLoad:12};return{monitor:w(M,s,m),invoke:h}}();

ClickTaleGlobal.scripts.filter = ClickTaleGlobal.scripts.filter || (function () {
	var recordingThreshold = Math.random() * 100;

	return {
		isRecordingApproved: function(percentage) {
			return recordingThreshold <= percentage;
		}
	}
})();
	
		
// Copyright 2006-2020 ClickTale Ltd., US Patent Pending
// PID: 382
// WR destination: www06
// WR version: latest
// Recording ratio: 0.15

(function (){
	var dependencyCallback;
        var scriptSyncTokens = ["wr"];
        var ct2Callback, isRecorderReady;
    var dependencies = scriptSyncTokens.slice(0);
    var clickTaleOnReadyList = window.ClickTaleOnReadyList || (window.ClickTaleOnReadyList = []);
    var indexOf = (function(){if(Array.prototype.indexOf){return function(array,value){return array.indexOf(value)}}return function(array,value){var length=array.length;for(var i=0;i<length;i++){if(array[i]===value){return i}}return -1}})();
    function isValidToken(token) {
        if (indexOf(scriptSyncTokens, token) > -1) {
            var index = indexOf(dependencies, token);

            if (index > -1) {
                dependencies.splice(index, 1);
                return true;
            }
        }

        return false;
    }

    clickTaleOnReadyList.push(function () {
        if (ct2Callback) {
            ct2Callback();
        }

        isRecorderReady = true;
    });

    ClickTaleGlobal.scripts.dependencies = {
        setDependencies: function (deps) {
            scriptSyncTokens = deps;
        },
        onDependencyResolved: function (callback) {
            dependencyCallback = callback;
        },
        notifyScriptLoaded: function (token) {
            if (isValidToken(token)) {
                if (dependencies.length === 0 && typeof dependencyCallback === "function") {
                    dependencyCallback();
                }
            }
        }
    };

    ClickTaleGlobal.scripts.integration = {
        onReady: function (callback) {
            if (isRecorderReady) {
                callback();
            }
            else {
                ct2Callback = callback;
            }
        }
    };
})();


window.ClickTaleGlobal.VisualEditorDesignerExists = !!0;

	ClickTaleSettings.Integration = ClickTaleSettings.Integration || {};
	ClickTaleSettings.Integration.ProjectType = 0;

window.ClickTaleIsXHTMLCompliant = true;
if (typeof (ClickTaleCreateDOMElement) != "function")
{
	ClickTaleCreateDOMElement = function(tagName)
	{
		if (document.createElementNS)
		{
			return document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
		}
		return document.createElement(tagName);
	}
}

if (typeof (ClickTaleAppendInHead) != "function")
{
	ClickTaleAppendInHead = function(element)
	{
		var parent = document.getElementsByTagName('head').item(0) || document.documentElement;
		parent.appendChild(element);
	}
}

if (typeof (ClickTaleXHTMLCompliantScriptTagCreate) != "function")
{
	ClickTaleXHTMLCompliantScriptTagCreate = function(code)
	{
		var script = ClickTaleCreateDOMElement('script');
		script.setAttribute("type", "text/javascript");
		script.text = code;
		return script;
	}
}	



// Start of user-defined pre WR code (PreLoad)
//PTC Code Version 8.1
!function () {
    var setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
        if (!this.isClickTaleXHR || (key === "Content-Type" && value === "text/plain")) {
            setRequestHeader.apply(this, arguments);
        }
    };
}();


window.ClickTaleUIDCookieName = 'WRUIDAWS20170811';

function deleteIrrelevantUIDCookies(relevant) {
    var cookieArray = document.cookie.replace(/\s+/g, '').split(";");
    var hostArray = location.host.split('.');
    var topDom = (hostArray.length <= 2 ? location.host : hostArray.slice(1).join('.'));
    for (var i = 0; i < cookieArray.length; i++) {
        var currentCookie = cookieArray[i];
        var cookieKey = currentCookie.substring(0, currentCookie.indexOf('='));
        if (cookieKey.indexOf('WRUID') > -1 && relevant.indexOf(cookieKey) == -1) {
            document.cookie = cookieKey + "='';domain=." + topDom + ";path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT;";
            document.cookie = cookieKey + "='';path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT;";
        }
    }
}
deleteIrrelevantUIDCookies([window.ClickTaleUIDCookieName]);




window.ClickTaleSettings = window.ClickTaleSettings || {};
window.ClickTaleSettings.PTC = window.ClickTaleSettings.PTC || {};
window.ClickTaleSettings.Compression = window.ClickTaleSettings.Compression || {};
if (document.readyState === 'complete') {
    window.ClickTaleIncludedOnWindowLoad = true;
}
window.ClickTaleIncludedOnDOMReady = true;
window.ClickTaleSettings.PTC.EnableChangeMonitor = false;
window.ClickTaleSettings.PTC.UseTransport = true;


window.ClickTaleSettings.ForceRecording = function () {
    if (document.location.href.toLowerCase().indexOf('genius') > -1) {
       return true;
    }
    else if (window["$u"] && window["$u"]["js_data"] && window["$u"]["js_data"]["genius_score_url"]){
        return true;
    }
    else {
        return false;
    }
}

window.ClickTaleSettings.CheckAgentSupport = function (f, v) {
    if (v.t == v.ED) {
        window.ClickTaleSettings.Compression.Async = false;
    }
    if (v.t == v.IE && v.v <= 11) {
        window.ClickTaleSettings.PTC.okToRunPCC = false;
        return false;
    }
    else {
        if (!(v.t == v.IE && v.v <= 10)) {
            window.ClickTaleSettings.PTC.EnableChangeMonitor = true;
            window.ClickTaleSettings.PTC.ConfigChangeMonitor();
        }
        var fv = f(v);
        window.ClickTaleSettings.PTC.okToRunPCC = fv;
        return fv;
    }
};
window.ClickTaleSettings.PTC.startsWith = function (strToTest, str) {
    return strToTest.lastIndexOf(str, 0) === 0;
};

window.ClickTaleSettings.Protocol = {
    Method: "ImpactRecorder"
};

window.ClickTaleSettings.Proxy = {
    WR: "ing-district.clicktale.net/ctn_v2/",
    ImageFlag: "ing-district.clicktale.net/ctn_v2/"
};

window.ClickTaleSettings.PTC.RulesObj = [{
    selector: "input[type=\"text\"], input[type=\"tel\"], input[type=\"email\"]",
    changeMon: {
        Attributes: ['value'],
        Text: false
    },
    rewriteApi: {
        Attributes: ['value'],
        Text: false
    }
}, {
	selector: ".CT_hidden, .CA_hidden, .property-selector span:not(.id), .js-guest-email, .info-booking-address, .info-booking-address, .info-booking-address, .reservation-guest-name,.search-tool-results span,.search-tool-results h3,.search-tool-results i",
    changeMon: {
        Attributes: false,
        Text: true
    },
    rewriteApi: {
        Attributes: false,
        Text: true
    }
}]

window.ClickTaleSettings.PTC.RulesObjRemoveEls = [
];


; (function () {
    if (typeof window.ClickTalePIISelector === 'string' && window.ClickTalePIISelector != '') {
        try {
            var domNodes = document.querySelectorAll(window.ClickTalePIISelector);
            if (domNodes) {
                window.ClickTaleSettings.PTC.RulesObj.push({
                    selector: window.ClickTalePIISelector,
                    changeMon: {
                        Attributes: ['value'],
                        Text: true
                    },
                    rewriteApi: {
                        Attributes: ['value'],
                        Text: true
                    }
                });
            }
        }
        catch (err) {
        }
    }
})();


window.ClickTaleSettings.PTC.cloneNodeIE9 = function (node) {
    var clone = node.nodeType === 3 ? document.createTextNode(node.nodeValue) : node.cloneNode(false);
    var child = node.firstChild;
    while (child) {
        var nodeName = child.nodeName.toLowerCase();
        if (nodeName == 'script') {
            var script = document.createElement('script');
            clone.appendChild(script);
        }
        else if (window.ClickTaleSettings.PTC.cloneNodeIE9.badEls[nodeName]) {
            var newN = document.createElement(nodeName);
            var attributes = child.attributes;
            var attrLength = attributes.length;
            for (var i = 0; i < attrLength; i++) {
                var attr = attributes[i];
                if (!/[,'"{};\.]/.test(attr.nodeName)) {
                    newN.setAttribute('ctdep-' + attr.nodeName, attr.nodeValue);
                }
            }
            clone.appendChild(newN);
        }
        else {
            clone.appendChild(window.ClickTaleSettings.PTC.cloneNodeIE9(child));
        }
        child = child.nextSibling;
    }
    return clone;
}

window.ClickTaleSettings.PTC.cloneNodeIE9.badEls = {
    'iframe': true,
    'img': true,
    'source': true
};

window.ClickTaleSettings.PTC.ConfigChangeMonitor = function () {

    if (window.ClickTaleSettings.PTC.EnableChangeMonitor) {

        window.ClickTaleSettings.XHRWrapper = {
            Enable: false
        };

        var script = document.createElement("SCRIPT");
        script.src = (document.location.protocol === "https:" ? "https://cdnssl." : "http://cdn.") + "clicktale.net/www/ChangeMonitor-latest.js";
        document.body.appendChild(script);

        window.ClickTaleSettings.ChangeMonitor = {
            Enable: true,
            LiveExclude: true,
            AddressingMode: "id",
            OnReadyHandler: function (changeMonitor) {
                changeMonitor.observe();

                var CMRemrule = window.ClickTaleSettings.PTC.RulesObjRemoveEls;
                if (CMRemrule) {
                    for (var i = 0; i < CMRemrule.length; i++) {
                        var rule = CMRemrule[i];
                        var CMlocation = rule['location'];
                        if ((!CMlocation || (CMlocation && document.location[CMlocation['prop']].toLowerCase().search(CMlocation.search) != -1))) {
                            if (rule.changeMon) {
                                changeMonitor.exclude(rule.changeMon);
                            }
                            if (rule.changeMonLive) {
                                changeMonitor.exclude({
                                    selector: rule.changeMonLive,
                                    multiple: true
                                });
                            }
                        }
                    }
                }
            },
            OnBeforeReadyHandler: function (settings) {
                settings.Enable = window.ClickTaleGetUID ? !!ClickTaleGetUID() : false;
                return settings;
            },
            Filters: {
                MaxBufferSize: 1000000,
                MaxElementCount: 10000
            },
            PII: {
                Text: [],
                Attributes: []
            }
        }

        var RulesObj = window.ClickTaleSettings.PTC.RulesObj;
        if (RulesObj) {
            window.ClickTaleSettings.ChangeMonitor.PII.Text = window.ClickTaleSettings.ChangeMonitor.PII.Text || [];
            window.ClickTaleSettings.ChangeMonitor.PII.Attributes = window.ClickTaleSettings.ChangeMonitor.PII.Attributes || [];
            for (var i = 0; i < RulesObj.length; i++) {
                var CMrule = RulesObj[i]['changeMon'];
                var CMlocation = RulesObj[i]['location'];
                if (!CMrule || (CMlocation && document.location[CMlocation['prop']].toLowerCase().search(CMlocation.search) === -1)) {
                    continue;
                }
                var selector = RulesObj[i]['selector'];
                var attributesArr = CMrule.Attributes;
                if (attributesArr instanceof Array) {
                    window.ClickTaleSettings.ChangeMonitor.PII.Attributes.push({
                        selector: selector,
                        transform: (function (attributesArr) {
                            return function (el) {
                                var attrs = el.attributes;
                                var attrsToReturn = {}
                                for (var i = 0; i < attrs.length; i++) {
                                    var name = attrs[i].nodeName;
                                    attrsToReturn[name] = attrs[i].nodeValue;
                                }
                                for (var u = 0; u < attributesArr.length; u++) {
                                    var attr = attributesArr[u];
                                    var attrib = el.getAttribute(attr);
                                    if (typeof attrib === 'string') {
                                        attrsToReturn[attr] = attrib.replace(/\w/g, '-');
                                    }
                                }

                                return attrsToReturn;
                            }
                        })(attributesArr)
                    });
                }
                if (CMrule.Text) {
                    window.ClickTaleSettings.ChangeMonitor.PII.Text.push({
                        selector: [selector, function (elements) {
        var els = Array.prototype.reduce.call(elements, function (curr, add) {
            return curr.concat(Array.prototype.slice.call(add.childNodes));
        }, []);
        return Array.prototype.filter.call(els, function (child) {
            return !!(child && child.nodeType === 3);
        });
    }],
                        transform: function (el) {
                            return el.textContent.replace(/\w/g, '-');
                        }
                    });
                }
            }
        }
    }
};


window.ClickTaleSettings.Compression = {
    Method: function () {
        return "lzw";
    }
};

window.ClickTaleSettings.RewriteRules = {
    OnBeforeRewrite: function (rewriteApi) {
        var bodyClone = ClickTaleSettings.PTC.cloneNodeIE9(document.documentElement);
        

        //AM - without ctdep-

        var subscriberId = '119729';
        var pid = '382';
        var storageUrl = 'https://s3.amazonaws.com/nv-p1-s3-assets-01/';
        var prefixSpecialCharacters = false;

        var urlCSS = storageUrl + subscriberId + '/' + pid + "/CSS/";


        Array.prototype.forEach.call(bodyClone.querySelectorAll('link[href][rel*="stylesheet"]'), function (el, ind) {
            if (el.href && el.href.indexOf("/" + pid + "/") < 0) {

                var AMCsshref = urlCSS + el.href.replace(/:\/\//g, "/").replace(/%20/g, " ");

                if (prefixSpecialCharacters && prefixSpecialCharacters.test(AMCsshref)) {
                    AMCsshref = AMCsshref.replace(/\?/g, "%253F").replace(/\&/g, "%26").replace(/\=/g, "%3D");
                }
                else {
                    AMCsshref = AMCsshref.replace(/\?.*/g, "");
                }

                el.setAttribute('href', AMCsshref);
            }
        });

        if (window.ClickTaleSettings.PTC.RulesObj) {
            rewriteApi.add(function (buffer) {

                var RulesObj = window.ClickTaleSettings.PTC.RulesObj;
                for (var i = 0; i < RulesObj.length; i++) {
                    var rewriteApirule = RulesObj[i]['rewriteApi'];
                    var rewriteApilocation = RulesObj[i]['location'];
                    if (!rewriteApirule || (rewriteApilocation && document.location[rewriteApilocation['prop']].toLowerCase().search(rewriteApilocation.search) === -1)) {
                        continue;
                    }
                    var selector = RulesObj[i]['selector'];
                    var elements = bodyClone.querySelectorAll(selector);

                    Array.prototype.forEach.call(elements, function (el, ind) {
                        var attributesArr = rewriteApirule.Attributes;
                        if (attributesArr instanceof Array) {

                            for (var u = 0; u < attributesArr.length; u++) {
                                var attr = attributesArr[u];
                                var attrib = el.getAttribute(attr);
                                if (typeof attrib === 'string') {
                                    el.setAttribute(attr, attrib.replace(/\w/g, '-'));
                                }
                            }

                        }
                        if (rewriteApirule.Text) {
                            var children = el.childNodes;
                            Array.prototype.forEach.call(children, function (child) {
                                if (child && child.nodeType === 3) {
                                    child.textContent = child.textContent.replace(/\w/g, '-');
                                }
                            });
                        }
                    });
                }

                //work on body
                var RulesObjRemoveEls = window.ClickTaleSettings.PTC.RulesObjRemoveEls;
                if (RulesObjRemoveEls) {
                    for (var i = 0; i < RulesObjRemoveEls.length; i++) {
                        if (RulesObjRemoveEls[i].rewriteApi) {
                            var elementsToRemove = bodyClone.querySelectorAll(RulesObjRemoveEls[i].rewriteApi);
                            Array.prototype.forEach.call(elementsToRemove, function (el, ind) {
                                if (el.parentNode) {
                                    el.parentNode.removeChild(el);
                                }
                            });
                        }
                        if (RulesObjRemoveEls[i].rewriteApiReplace) {
                            var elementsToReplace = bodyClone.querySelectorAll(RulesObjRemoveEls[i].rewriteApiReplace);
                            Array.prototype.forEach.call(elementsToReplace, function (el, ind) {
                                if (el.parentNode) {
                                    var comment = document.createComment(el.outerHTML);
                                    el.parentNode.replaceChild(comment, el);
                                }
                            });
                        }
                    }
                }

                return bodyClone.innerHTML.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, '<script><\/script>').replace(/(<div id="?ClickTaleDiv"?[^>]+>)\s*<script[^>]+><\/script>\s*(<\/div>)/i, '$1$2');
            });
        }
        rewriteApi.add({
            pattern: /ctdep-/gi,
            replace: ''
        });

        rewriteApi.add({
            pattern: /(<head[^>]*>)/i,
            replace: '$1<script type="text\/javascript" class="cm-ignore" src="http:\/\/dummytest.clicktale-samples.com\/GlobalResources\/jquery.js"><\/script>'
        });



        // ========= FONTS ===========
        rewriteApi.add({
            pattern: new RegExp('@font-face{.*?}', 'gim'),
            replace: ''
        });


        // End region: "Assets Manager rewrite code"
        //////////////////////////////////////////////
        //////////////////////////////////////////////
    }
};

function ClickTaleOnXHRCreated(xhr) {
    xhr.isClickTaleXHR = true;
}

if (window["ClickTaleMonitor"] && window["ClickTaleMonitor"]["Settings"] && window["ClickTaleMonitor"]["Settings"]["get"]) { 
    var settings = ClickTaleMonitor.Settings.get();
    settings.onXhrCreated(function (xhr) {
        xhr.skipAddingCSRFHeader = true;
    });
}

// End of user-defined pre WR code


var isHttps = document.location.protocol == 'https:',
	scriptSource = window.ClickTaleScriptSource,
	pccSource = scriptSource;

if (!scriptSource) {
	window.ClickTaleScriptSource = isHttps ? 'https://cdnssl.clicktale.net/www/' : 'http://cdn.clicktale.net/www/';
}

ClickTaleGlobal.init.monitorScriptName = "Monitor-latest.js";
ClickTaleGlobal.init.isAllowed && typeof ClickTaleGlobal.init.pmc === "function" && ClickTaleGlobal.init.pmc(autoMonitorConfig);

if(!ClickTaleGlobal.init.pccRequested) {
		
	var pccSrc = pccSource ? pccSource + '9ab8166d-8a74-4f5b-8b6f-42c1717e3004.js?DeploymentConfigName=Release_20171101&Version=12' : (isHttps ? 'https://cdnssl.clicktale.net/www06/pcc/9ab8166d-8a74-4f5b-8b6f-42c1717e3004.js?DeploymentConfigName=Release_20171101&Version=12' : 'http://cdn.clicktale.net/www06/pcc/9ab8166d-8a74-4f5b-8b6f-42c1717e3004.js?DeploymentConfigName=Release_20171101&Version=12');
			var pccScriptElement = ClickTaleCreateDOMElement('script');
	pccScriptElement.type = "text/javascript";
	pccScriptElement.crossOrigin = "anonymous";
		pccScriptElement.async = true;
		if(ClickTaleGlobal.scripts.sri && ClickTaleGlobal.scripts.sri.hashes){
        pccScriptElement.integrity = ClickTaleGlobal.scripts.sri.hashes.pcc;
        pccScriptElement.src = ClickTaleGlobal.scripts.sri.path + "pcc.js";
	}else {
       pccScriptElement.src = pccSrc;
    }
	
	ClickTaleGlobal.init.isAllowed && document.body.appendChild(pccScriptElement);
		ClickTaleGlobal.init.pccRequested = true;
}
	window.ClickTaleGlobal.PCCExists = true;
	
window.ClickTalePrevOnReady = typeof window.ClickTaleOnReady == 'function' ? window.ClickTaleOnReady : void 0;

window.ClickTaleOnReady = function() {
	var PID=382, 
		Ratio=0.15, 
		PartitionPrefix="www06",
		SubsId=119729;
	
	if (window.navigator && window.navigator.loadPurpose === "preview") {
       return;
	};
		
	
	// Start of user-defined header code (PreInitialize)
	
if (typeof ClickTaleSetAllSensitive === "function") {
    ClickTaleSetAllSensitive();
};


window.ClickTaleSettings.PTC.InitFuncs = window.ClickTaleSettings.PTC.InitFuncs || [];
window.ClickTaleSettings.PTC.InitFuncs.push(function () {
    var pcc = document.querySelector('script[src*="clicktale"][src*="pcc"]');
    if (pcc) {
        var versionmatch = pcc.src.match(/DeploymentConfigName=(.+)/i);
        if (versionmatch && typeof ClickTaleExec === 'function') {
            ClickTaleExec("console.info('" + versionmatch[0] + "');");
            ClickTaleEvent("Config: " + versionmatch[1].replace(/\&.+/, ''));
        }
    }
});


if (typeof ClickTaleUploadPage === 'function' && window.ClickTaleSettings.PTC.UseTransport) {
    ClickTaleUploadPage();

    var initFuncs = window.ClickTaleSettings.PTC.InitFuncs;
    for (var i = 0, initLen = initFuncs.length; i < initLen; i++) {
        if (typeof initFuncs[i] === 'function') {
            initFuncs[i]();
        }
    }
};
	// End of user-defined header code (PreInitialize)
    
	
	window.ClickTaleIncludedOnDOMReady=true;
	
	ClickTaleGlobal.init.isAllowed && ClickTale(PID, Ratio, PartitionPrefix, SubsId);
	
	if((typeof ClickTalePrevOnReady == 'function') && (ClickTaleOnReady.toString() != ClickTalePrevOnReady.toString()))
	{
    	ClickTalePrevOnReady();
	}
	
	
	// Start of user-defined footer code
	
	// End of user-defined footer code
	
}; 
(function() {
	var div = ClickTaleCreateDOMElement("div");
	div.id = "ClickTaleDiv";
	div.style.display = "none";
	document.body.appendChild(div);

if (document.location.protocol == 'https:')
{
	
		var wrScript = ClickTaleCreateDOMElement("script");
	wrScript.crossOrigin = "anonymous";
	wrScript.type = 'text/javascript';
		wrScript.async = true;
		if(ClickTaleGlobal.scripts.sri && ClickTaleGlobal.scripts.sri.hashes){
        wrScript.integrity = ClickTaleGlobal.scripts.sri.hashes.wr;
        wrScript.src = ClickTaleGlobal.scripts.sri.path + "wr.js";
	}else {
        wrScript.src = window.ClickTaleScriptSource + 'WR-latest.js';
    }

	ClickTaleGlobal.init.isAllowed && document.body.appendChild(wrScript);
}
})();







var ctVEconfig={VE_BASE_URL:"https://ve-cec-na1.app.clicktale.com/",VE_PROXY_BASE_URL:"https://vep-cec-na1.app.clicktale.com/"};!function(){try{var e=window.chrome,t=window.navigator&&window.navigator.vendor;null!=e&&"Google Inc."===t&&window.addEventListener&&addEventListener("message",o,!1);var n=window.location.search.substring(window.location.search.indexOf("ctAdvancedSearch=")).split("&")[0].split("=");"ctAdvancedSearch"==n[0]&&"true"==n[1]&&c("ctAdvancedSearchModule",ctVEconfig.VE_BASE_URL+"client/dist/advancedSearchModule.js")}catch(e){}function o(e){var t;try{t=JSON.parse(e.data)}catch(e){return}!1!==new RegExp("(app[.]clicktale[.]com)($|:)").test(e.origin)&&(window.ct_ve_parent_window=e.source,"CT_testRules"==t.name&&(sessionStorage.setItem("CT_testRules",!0),console.log((new Date).toJSON(),"PostPTC: testRules ",sessionStorage.getItem("CT_testRules")),window.ct_ve_parent_window.postMessage({name:"testRulesRecieved",params:{}},"*")),"CTload_ve"===t.function&&"function"==typeof ClickTaleGetPID&&null!==ClickTaleGetPID()&&(function(){console.log((new Date).toJSON(),"PostPTC: start loading test rules");var e=ClickTaleGetPID();c("ctTestRulesModule",ctVEconfig.VE_BASE_URL+"rulesEngineContent/TestPCC/"+e,function(){sessionStorage.setItem("CT_testRules_Loaded",!0),console.log((new Date).toJSON(),"PostPTC: test rules loaded")})}(),c("ctVisualEditorClientModule",ctVEconfig.VE_BASE_URL+"client/dist/veClientModule.js")))}function c(e,t,n){var o=function(e){return document.createElementNS?document.createElementNS("http://www.w3.org/1999/xhtml",e):document.createElement(e)}("script");o.setAttribute("type","text/javascript"),o.setAttribute("id",e),o.src=t,void 0!==n&&(o.onload=n),document.getElementById(e)||document.body.appendChild(o)}}();

//Signature:lN0J9tYwKJVlH1bjcTxp1AN5rCsmr5OuwObS9wXXVPQgIKhxKFK1vKqzP7nN1DLwjeKrsdFj1n7QTB0BW8Mx0j/QFpRoLF8FBcC003MhjmLxHMGaEyAWB+x5s/tlnTUq6tAAyk/hQjzVd0uy4IZWujJENl1yXJjG2JP1VYzEwsQ=