$(function() {
    let $formfloating = $('.form-floating');
    $formfloating.on('keyup', 'input, textarea', function(event) {
        if ($(this).val().length > 0) {
            $(this).addClass('filled')
        } else {
            $(this).removeClass('filled')
        }
    });
});

$('.form-floating').find('input, textarea, select').each(function() {
    if ($(this).val() != "") {
        $(this).addClass('filled')
    } else {
        $(this).removeClass('filled')
    }
});

/* 
STARTS triggers & toggles[

data-trigger => value = target element id to be opened
data-target-close => value = target element id to be closed
data-close-on-click-outside => value 
*/

$('body').find('*[data-trigger]').click(function() {

    var targetElmId = $(this).data('trigger');
    var elmToggleClass = targetElmId + '--on';
    if ($('body').hasClass(elmToggleClass)) {
        $('body').removeClass(elmToggleClass);
    } else {
        $('body').addClass(elmToggleClass);
    }


    _close.on('click', function(e) {
        e.preventDefault();
        _target.removeClass('visible');
    });

    _this.on('click', function(e) {
        e.preventDefault();
        _target.toggleClass('visible');
    });

});

$('body').find('*[data-target-close]').click(function() {
    var targetElmId = $(this).data('target-close');
    $('body').toggleClass(targetElmId + '--on');

});

$('body').mouseup(function(event) {

    if ($(event.target).data('trigger') != '' && typeof $(event.target).data('trigger') !== typeof undefined) {
        event.preventDefault();
        return;
    }

    $('body').find('*[data-close-on-click-outside]').each(function(idx, elm) {
        var slctr = $(elm);
        if (!slctr.is(event.target) && !$.contains(slctr[0], event.target)) {
            $('body').removeClass(slctr.data('close-on-click-outside') + '--on');
            $('body').find('*[data-trigger]').removeClass('open-shade');
        }
    });
});

/*
] ENDS triggers & toggles
*/



/* begin:tabs */
$(document).ready(function() {
    $(window).bind('hashchange', function(event) {
        var url = window.location.href.split('#')[0];
        window.history.pushState({}, document.title, url);
    });

    moveToTargetDiv($('#fatbit-tabs li.is--active'));
    moveToTargetDiv($('#fatbit-tabs2 li.is--active'));
    $('.js-tabs li').click(function() {
        $(this).siblings().removeClass('is--active');
        $(this).addClass('is--active');
        moveToTargetDiv(this);
        return false;
    });

    var tabs = $(".js-tabs li a");

    tabs.click(function() {
        var content = this.hash.replace('/', '');
        tabs.removeClass("active");
        $(this).addClass("active");
        $(this).parents('.container').find('.tabs-content').find('.content-data').removeClass("active");
        $(content).addClass("active");

    });

});

function moveToTargetDiv(liElm) {

    var out = $(liElm).parent().parent();
    var tar = $(liElm);
    var x = out.width();
    var y = tar.outerWidth(true);
    var z = tar.index();
    var q = 0;
    var m = out.find('li');

    for (var i = 0; i < z; i++) {
        q += $(m[i]).outerWidth(true) + 4;
    }

    out.animate({
        scrollLeft: Math.max(0, q)
    }, 800);
    return false;
}
/* function moveToTargetDivOld(target, outer) {
    debugger;
	var out = $(outer);
	var tar = $(target);
	var x = out.width();
	var y = tar.outerWidth(true);
	var z = tar.index();
	var q = 0;
	var m = out.find('li');

	for (var i = 0; i < z; i++) {
		q += $(m[i]).outerWidth(true) + 4;
	}

	out.animate({
		scrollLeft: Math.max(0, q)
	}, 800);
	return false;
} */
/* end:tabs */




/* begin:table scroll hint */
//new ScrollHint('.js--table-scrollable');
/* end:table scroll hint */

$(function() {
    $('[data-toggle="tooltip"]').tooltip()
})

$(function() {
    $('[data-toggle="popover"]').popover()
})

$('.dropdown-menu').on('click', function(e) {
    e.stopPropagation();
});

/* for footer */
if ($(window).width() < 576) {
    /* FOR FOOTER TOGGLES */
    $('.toggle__trigger-js').click(function() {
        if ($(this).hasClass('is-active')) {
            $(this).removeClass('is-active');
            $(this).siblings('.toggle__target-js').slideUp();
            return false;
        }
        $('.toggle__trigger-js').removeClass('is-active');
        $(this).addClass("is-active");
        $('.toggle__target-js').slideUp();
        $(this).siblings('.toggle__target-js').slideDown();
    });
}


/* for fixed header */

$(window).scroll(function() {
    body_height = $("#body").position();
    scroll_position = $(window).scrollTop();

    if (body_height.top < scroll_position)
        $("body").addClass("header-fixed");
    else
        $("body").removeClass("header-fixed");

});

/*Back to Top */
var btn = $('#back-top');

$(window).scroll(function() {
    if ($(window).scrollTop() > 300) {
        btn.addClass('show');
    } else {
        btn.removeClass('show');
    }
});

btn.on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, '300');
});