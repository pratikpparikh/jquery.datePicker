(function($){
  $.fn.datePicker = function(opts) {

    if (opts && opts.command == 'toggle') {
      this.get(0).datePicker.toggle();
      return this;
    }

    var defaults = {selected: null, minimumDate: null, maximumDate: null,iwItem:null};
    var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    var abbreviations = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');
    var daySelector = 'td:not(.m):not(:empty)';

    return this.each(function() {
      if (this.datePicker) { return false; }
      var options = $.extend({}, defaults, opts);
      var $input = $(this);
      var $container = currentDate = mode = null;
      var self = {
        initialize: function() {
          $input.click(function (event) {self.show(); return false;}).keydown(function(e){ if (e.keyCode == 13) { self.entered(); return false; }});
          $(document).keydown(function(e) { if (e.keyCode == 27) { self.hide(); }}).click(self.hide);
          $container = self.initializeContainer().hide()
            .append(self.buildMonth(new Date()))
            .delegate(daySelector, 'click', self.clicked)
            .delegate('td:not(:empty)', 'hover', self.hover)
            .delegate('.prev', 'click', self.loadPrevious)
            .delegate('.next', 'click', self.loadNext)
            .delegate('.month', 'click', self.pickMonth)
            .delegate('.year', 'click', self.pickYear)
            .click(function(){return false;});
        },
        parseDate: function(value) { return new Date(value); },
        toggle: function() { $container.is(':visible') ? self.hide() : self.show(); },
        show: function() { $container.show(); },
        hide: function() { $container.hide(); },
        loadPrevious: function() {
          var monthYearHandler = $container.find("div.month");
            var monthYearArray = monthYearHandler.text().split(" ");
            var monthName = monthYearArray[0];
            var year =  monthYearArray[1];
            var currentMonth = $.inArray(monthName,months)
            $container.empty().append(self.buildMonth(new Date(year, currentMonth-1, 1)));
        },
        loadNext: function() {
        	var monthYearHandler = $container.find("div.month");
            var monthYearArray = monthYearHandler.text().split(" ");
            var monthName = monthYearArray[0];
            var year =  monthYearArray[1];
            var currentMonth = $.inArray(monthName,months)
            $container.empty().append(self.buildMonth(new Date(year, currentMonth+1, 1)));
        },
        hover: function() {
          $(this).toggleClass('hover');
        },
        clicked: function() {
          var $cell = $(this);         
          if (mode == 'month') {
        	  var year = $($($($(this).parent()).parent()).find("td.year")).text();
        	  $container.empty().append(self.buildMonth(new Date(year, (4*($cell.parent().index()-1)) + $cell.index(), 1)));
          } else if (mode == 'year') {
            currentDate = new Date($cell.text(), 0, 1);
            self.pickMonth(new Date($cell.text(), 0, 1));
          } else {
			var monthYearHandler = $container.find("div.month");
			var monthYearArray = monthYearHandler.text().split(" ");
			var monthName = monthYearArray[0];
			var year =  monthYearArray[1];
			var currentMonth = $.inArray(monthName,months)
			$container.find('td.selected').removeClass('selected');
			$cell.addClass('selected');            
			var date = new Date(year, currentMonth, $cell.text());
			$input.val(self.format(date)).change();
			if(options.iwItem)
			{
				options.iwItem.setValue(self.formatISO(date));
				options.iwItem.setReadOnly(true);
			}
			if (options.selected != null) { options.selected(date, $cell); }
			self.hide();
          }
        },
        entered: function() {
          var date = self.parseDate($input.val().replace(/^\s*/, '').replace(/\s*$/, ''));
          if (date == null) { return; }
          $container.empty().append(self.buildMonth(date)).find(daySelector).eq(date.getDate()-1).click();
        },
        initializeContainer: function() {
          return $('<div>').addClass('calendar').insertAfter($input);
        },
        pickYear: function() {
          mode = 'year';
          var year =  $container.find("td.year").text()
          var table = document.createElement('table');
          var start = year - 6;
          if (options.minimumDate && options.minimumDate > start) { start = options.minimumDate.getFullYear(); }
          for (var i = 0; i < 3; ++i) {
            var row = table.insertRow(-1);
            for (var j = 0; j < 4; ++j) {
              var cell = row.insertCell(-1);
              cell.innerHTML = start + (4*i) + j;
            }
          }
          $container.empty().append(table);
        },
        pickMonth: function(startDateOfNewYear) {
          mode = 'month';
          var monthYearHandler = $($container.find("div.month"));
          var yearString = "";
          if(startDateOfNewYear === 'undefined' || !(startDateOfNewYear instanceof Date))
          {
        	  var monthYearArray = monthYearHandler.text().split(" ");
	          var monthName = monthYearArray[0];
	          yearString =  monthYearArray[1];
          }else{
	          yearString =  startDateOfNewYear.getFullYear();
          }
          var table = document.createElement('table');
          var header = table.insertRow(-1);
          var year = header.insertCell(-1);
          year.colSpan = 4;
          year.className = 'm year';
          year.innerHTML = yearString;
          
          //could make this static...
          for (var i = 0; i < 3; ++i) {
            var row = table.insertRow(-1);
            for (var j = 0; j < 4; ++j) {
              var cell = row.insertCell(-1);
              cell.innerHTML = abbreviations[4*i+j];
            }
          }
          $container.empty().append(table);
        },
        buildMonth: function(date) {
          mode = 'day';
          var first = new Date(date.getFullYear(), date.getMonth(), 1);
          var last = new Date(date.getFullYear(), date.getMonth()+1, 0);
          currentDate = first;
          var firstDay = first.getDay();
          var totalDays = last.getDate();
          var weeks = Math.ceil((totalDays + firstDay) / 7);
          var table = document.createElement('table');

          for (var i = 0, count = 1; i < weeks; ++i) {
            var row = table.insertRow(-1);
            for(var j = 0; j < 7; ++j, ++count) {
              var cell = row.insertCell(-1);
              if (count > firstDay && count <= totalDays+firstDay) {
                cell.innerHTML = count - firstDay;
              }
            }
          }

          var header = table.insertRow(0);
          self.addHeaderCell(header, '<div class="prev">&laquo;</div>', 1);
          self.addHeaderCell(header, '<div class="month">' + months[date.getMonth()] + ' ' + date.getFullYear() + '</div>', 5);
          self.addHeaderCell(header, '<div class="next">&raquo;</div>', 1);

          var $table = $(table);
          if (options.minimumDate && options.minimumDate >= first) { $table.find('.prev').hide(); }
          if (options.maximumDate && options.maximumDate <= last) { $table.find('.next').hide(); }
          return $table;
        },
        addHeaderCell: function(header, html, colspan) {
          var cell = header.insertCell(-1);
          cell.innerHTML = html;
          cell.className = 'm '; //very stupid IE (all versions) fix
          cell.colSpan = colspan;
        },
        format: function(date) {
          return months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
        },
        formatISO:function(date){
        	var addNowTime = false;
        	if(date == null)
		    {
        		date = new Date();
		    }
			var twoDigitMonth = date.getMonth() + 1+"";
			if(twoDigitMonth.length==1){
				twoDigitMonth="0" +twoDigitMonth;
			}
			var twoDigitDate = date.getDate()+"";
			if(twoDigitDate.length==1){
				twoDigitDate="0" +twoDigitDate;
			}
			var time = "";
			if(addNowTime == true){ 
				time = "T" + formatTimeOfDay($.now());
			}else{ 
				time = "T00:00:00";
			}
			var returnDateTime = twoDigitMonth + "/" + twoDigitDate + "/" + date.getFullYear() + time;
			return returnDateTime;
        }
      };
      this.datePicker = self;
      self.initialize();
    });
  }
})(jQuery);
