	

jQuery(document).ready(function(){

	var winWidth = jQuery(window).width();
	// jQuery('.searach-wrap .search-icon').click(function(){
	// 	jQuery('.search-dropdown').slideToggle();
	// });

	jQuery('.searach-wrap .search-icon').click(function(){
		jQuery('.search-dropdown').toggleClass('abc');	
	});

	jQuery('.shoping-cart .icon-shop-cart').click(function(){
		jQuery('.cart-dropdown-wrap').fadeIn();
		jQuery('.cart-dropdown').animate({
			 right:'0px'	 
		});	 

		// cart height
		  var winHt =  jQuery(window).height();
		  var mincartHT = jQuery('.minicart-footer').height();  
		  var minheadertHT =  jQuery('.minicart-header').height();	  
		  var blksubttlHT =  jQuery('.cart-header').height();	  
		  var newHT = parseInt(mincartHT) + parseInt(minheadertHT) + parseInt(blksubttlHT);
		  // alert(winHt-newHT-30);
	  	jQuery('#mini-cart-summary').height(winHt-newHT-40);
	  	jQuery('.mobile-cart #mini-cart-summary').height(winHt-newHT-40);	

		// Cart hide on document click function
		jQuery(".cart-search .shoping-cart").click(function(e){
			e.stopPropagation();
		});

		jQuery('.cart-dropdown').click(function(e){			
			e.stopPropagation();
		});

		jQuery(document).click(function(){
			jQuery('.cart-dropdown-wrap').fadeOut();
			jQuery('.cart-dropdown').animate({
			 right:'-425px'  
			}); 
		});

	});

	jQuery('.cart-dropdown .close').click(function(e){
		e.stopPropagation();		
		jQuery('.cart-dropdown-wrap').fadeOut();
		jQuery('.cart-dropdown').animate({
			 right:'-425px'	 
		});	
	});








// Mini Cart 
      


	// menu in 

	jQuery('#narrow-by-list .cattree').click(function(ev){
		//alert(120);
		ev.preventDefault();
		jQuery(this).toggleClass('fa-minus');		
		jQuery(this).siblings('ol').slideToggle(); 

	});

	if(jQuery(document).find('.amshopby-advanced li.level0').hasClass('parent')){	
	  jQuery(document).find('.amshopby-advanced li.parent >span').trigger('click');
	}

	// language change click function
	jQuery('.store-language-container a').click(function(){	
		jQuery('.store-language-container a').removeClass('active');
		jQuery(this).addClass('active');  		
	});




	/*
		For Slider  slick-slider
	=========================*/ 
	jQuery('.homeBanner').slick({
		dots: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
  		autoplaySpeed: 2000,

	});

   jQuery(".sale").slick({
    dots: true,
    arrows: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
  	autoplaySpeed: 2000,
	    responsive: [
	    {
	      breakpoint: 1024,
	      settings: {
	        slidesToShow: 1,
	        slidesToScroll: 1,
	        infinite: true,
	      }
	    },
	    {
	      breakpoint: 600,
	      settings: {
	        slidesToShow: 2,
	        slidesToScroll: 2
	      }
	    },
	    {
	      breakpoint: 480,
	      settings: {
	        slidesToShow: 1,
	        slidesToScroll: 1
	      }
	    }
	  ]
  });
  jQuery(".regular").slick({
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
	autoplaySpeed: 2000,
      responsive: [
	    {
	      breakpoint: 1024,
	      settings: {
	        slidesToShow: 3,
	        slidesToScroll: 1,
	        infinite: true,
	        dots: false
	      }
	    },
	    {
	      breakpoint: 600,
	      settings: {
	        slidesToShow: 2,
	        slidesToScroll: 1
	      }
	    },
	    {
	      breakpoint: 480,
	      settings: {
	        slidesToShow: 2,
	        slidesToScroll: 1
	      }
	    }
	  ]
  	});
	jQuery(".blogrelated").slick({
	    dots: false,
	    infinite: true,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    autoplay: true,
  		autoplaySpeed: 2000,
	      responsive: [
		    {
		      breakpoint: 1024,
		      settings: {
		        slidesToShow: 3,
		        slidesToScroll: 1,
		        infinite: true,
		        dots: false
		      }
		    },
		    {
		      breakpoint: 600,
		      settings: {
		        slidesToShow: 2,
		        slidesToScroll: 1
		      }
		    },
		    {
		      breakpoint: 480,
		      settings: {
		        slidesToShow: 2,
		        slidesToScroll: 1
		      }
		    }
		  ]
  	});

	/* 
		Popup 
	==============================================*/

  	jQuery(function() {
		    //----- OPEN
		    jQuery('[data-popup-open]').on('click', function(e)  {
		        var targeted_popup_class = jQuery(this).attr('data-popup-open');
		        jQuery('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
		 
		        e.preventDefault();
		    });
		 
		    //----- CLOSE
		    jQuery('[data-popup-close]').on('click', function(e)  {
		        var targeted_popup_class = jQuery(this).attr('data-popup-close');
		        jQuery('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);		 
		        e.preventDefault();
		    });
		});


  /* 
   	Footer slide Menu
  ==============================================*/ 

  if(winWidth<768){
  	jQuery('.footer-link h3').click(function(){
  		jQuery(this).toggleClass('active');
  		jQuery(this).siblings('ul').slideToggle();
  	});
  }



  /* For side menu  */

  jQuery('.menu-category a i, .sidebar .toggle-content li i').click(function(ev){
  	ev.preventDefault();
  	jQuery(this).toggleClass('fa-minus');
  	jQuery(this).parent().siblings().slideToggle();
  });



  /* Product detail page  */

  var prodimght = jQuery('.product-image-gallery').height();
  var prod_desc = jQuery('.detail-second-column').height();

  if(winWidth>767) {
  	//jQuery('.detail-second-column').height(prodimght);
  	if(prodimght>prod_desc) {
  		jQuery('.detail-second-column').css('min-height', prodimght);
  		jQuery('.detail-second-column').addClass('static');
  	}
  }

  // minicart sidebar

  

  //alert(winHt);

  // jQuery('#mini-cart-summary').height(winHt-170); 

  /* Make equal heighr for blog page */
	

//   if(jQuery('.amshopby-advanced .level0').hasClass('parent')){
// 	// jQuery('li.level0.parent > ol').css("display", "block");	
// }


  function equalblogHeight(){ 	
  	var mainBlog =  jQuery('.is-blog .col-main').height();
  	var mainBlog_left =  jQuery('.is-blog .col-left').height();
  	if(winWidth>767) {  		
  		if(mainBlog>mainBlog_left) {  			
  			jQuery('.is-blog .col-left').height(mainBlog-100);  			
  		}
  	} 
  }
  //equalblogHeight(); 



  // For toogle in listing page
  // jQuery('#narrow-by-list dt').click(function(){
  // 	alert(111);
  // 	jQuery(this).next('dd').slideToggle();
  // });


// JQuery for FAQ page
jQuery(".faqbox li > a").click(function() {
    jQuery(this).parent().toggleClass('active').find('.insidefaq').slideToggle('fast');
    jQuery(".faqbox li > a").not(this).parent().removeClass('active').find('.insidefaq').slideUp('fast');
  });

 

// JQuery for Count 12 category
// function countcategorylist(){ 	
// var catlength =  jQuery('.amshopby-advanced > li.amshopby-cat').length;
// alert(catlength);
// 	// if(catlength<=4) {  		
// 	// 	jQuery(".linkshow").hide();
// 	// } else {
// 	// 	jQuery(".linkshow").show();
// 	// }
// }



});

// jQuery(window).resize(function(){
// 	var mainBlog =  jQuery('.is-blog .col-main').height();
//   	var mainBlog_left =  jQuery('.is-blog .col-left').height();
// 	equalblogHeight();
// });


// jQuery(document).ready(function(){

// jQuery('.searach-wrap .search-icon').click(function(){
// 	jQuery('.search-dropdown').toggleClass('abc');	
// });

// });


