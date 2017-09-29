
var common = (function() {
    /* bootstrap popover */
    function popBy(obj, message, direct) {
        $(obj).popover('destroy');
        $(obj).popover({
            placement: direct ||'bottom',
            trigger: 'manual',
            content: message,
            container: 'body'
        });

        clearTimeout($(obj).data('timeout1986'));
        $(obj).popover('show');
        var timeout = setTimeout(function () { $(obj).popover('hide'); }, 3000);
        $(obj).data('timeout1986',timeout);
    }

    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function(m, i) {
            return args[i];
        });
    };

    String.format = function() {
        if (arguments.length == 0)
            return null;

        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }

        return str;
    };

    function getQueryString(key) {
        var value = "";
        var sURL = window.document.URL.split('#')[0];

        if (sURL.indexOf("?") > 0) {
            var arrayParams = sURL.split("?");
            var arrayURLParams = arrayParams[1].split("&");

            for (var i = 0; i < arrayURLParams.length; i++) {
                var sParam = arrayURLParams[i].split("=");

                if ((sParam[0] == key) && (sParam[1] != "")) {
                    value = sParam[1];
                    break;
                }
            }
        }

        return decodeURI(value);
    }

    /* checkbox start */
    function selectAllChk(all, item) {
        $(item).prop('checked', $(all).prop('checked'));
    }

    function selectItemChk(item, all) {
        $(all).prop('checked', $(item + ":checked").length === $(item).length);
    }

    /* checkbox end */

    /* scroll start */
    function getScrollTop() {
        var scrollTop = 0;
        if (document.documentElement && document.documentElement.scrollTop) {
            scrollTop = document.documentElement.scrollTop;
        }
        else if (document.body) {
            scrollTop = document.body.scrollTop;
        }
        return scrollTop;
    }

    function getScrollTopBy(name) {
        var tag = document.getElementById(name);
        return tag.scrollTop;
    }

    function getClientHeight() {
        var clientHeight = 0;
        if (document.body.clientHeight && document.documentElement.clientHeight) {
            clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
        }
        else {
            clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
        }
        return clientHeight;
    }


    function getClientHeightBy(name) {

        var tag = document.getElementById(name);
        var clientHeight = 0;
        return tag.clientHeight;
    }

    function getScrollHeight() {
        return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    }

    function getScrollHeightBy(name) {
        var tag = document.getElementById(name);
        return tag.scrollHeight;
    }


    function reachBottom() {
        if ((getScrollTop() + getClientHeight()) / getScrollHeight() >= 1 && getScrollTop()>0) return true;
        else return false;
    }

    function reachBottomBy(name) {
        if ((getScrollTopBy(name) + getClientHeightBy(name)) / getScrollHeightBy(name) >= 1 && getScrollTopBy(name)>0)
            return true;
        else return false;
    }
    /* scroll end */

    /* offset start */
    function getOffset(evt) {
        var target = evt.target;
        if (target.offsetLeft == undefined) {
            target = target.parentNode;
        }
        var pageCoord = getPageCoord(target);
        var eventCoord = {
            x: window.pageXOffset + evt.clientX,
            y: window.pageYOffset + evt.clientY
        };
        var offset = {
            offsetX: eventCoord.x - pageCoord.x,
            offsetY: eventCoord.y - pageCoord.y
        };
        evt.offsetX = offset.offsetX;
        evt.offsetY = offset.offsetY;
        return offset;
    }

    function getPageCoord(element) {
        var coord = {x: 0, y: 0};
        while (element) {
            coord.x += element.offsetLeft;
            coord.y += element.offsetTop;
            element = element.offsetParent;
        }
        return coord;
    }
    /* offset end */

    function HTMLEncode(html) {
        var temp = document.createElement("div");
        (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
        var output = temp.innerHTML;
        temp = null;
        return output;
    }

    function HTMLDecode(text) {
        var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }

    //textarea移动光标
    function insertText(obj,str) {
        if (document.selection) {
            var sel = document.selection.createRange();
            sel.text = str;
        } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            var startPos = obj.selectionStart,
                endPos = obj.selectionEnd,
                cursorPos = startPos,
                tmpStr = obj.value;
            obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += str.length;
            obj.selectionStart = obj.selectionEnd = cursorPos;

        } else {
            obj.value += str;
        }

    }

    //textarea移动光标
    function moveCursor(obj, length){
        obj.focus();
        var len = length || obj.value.length;
        if (document.selection) {
            var sel = obj.createTextRange();
            sel.moveStart('character',len);
            sel.collapse();
            sel.select();
        } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {
            obj.selectionStart = obj.selectionEnd = len;
        }
    }

    return {
        popBy: popBy,
        getQueryString: getQueryString,
        selectAllChk: selectAllChk,
        selectItemChk: selectItemChk,
        getScrollTop: getScrollTop,
        getScrollTopBy: getScrollTopBy,
        getClientHeight: getClientHeight,
        getClientHeightBy: getClientHeightBy,
        getScrollHeight: getScrollHeight,
        getScrollHeightBy: getScrollHeightBy,
        reachBottom: reachBottom,
        reachBottomBy: reachBottomBy,
        getOffset: getOffset,
        getPageCoord: getPageCoord,
        HTMLEncode: HTMLEncode,
        HTMLDecode: HTMLDecode,
        insertText: insertText,
        moveCursor: moveCursor
    };
})();



 if (typeof define === "function" && define.amd) {
     define(['bootstrap', 'jquery'], function() {
         return common;
     });
 }




