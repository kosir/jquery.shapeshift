// Generated by CoffeeScript 1.4.0
(function() {

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "shapeshift";
    defaults = {
      selector: "*",
      enableResize: true,
      cssAnimations: true,
      align: "center",
      columns: null,
      colWidth: null,
      gutterX: 10,
      gutterY: 10,
      states: {
        init: {
          style: {
            marginTop: -100,
            opacity: 0
          }
        },
        normal: {
          animated: true,
          speed: 200,
          staggeredIntro: true,
          style: {
            marginTop: 0,
            opacity: 1
          }
        }
      }
    };
    Plugin = (function() {

      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.$container = $(element);
        this.grid = {};
        this.state = null;
        if (this.errorCheck()) {
          this.init();
        }
      }

      Plugin.prototype.errorCheck = function() {
        return true;
      };

      Plugin.prototype.init = function() {
        this.enableFeatures();
        this.createEvents();
        this.setParsedChildren();
        this.initializeGrid();
        this.calculateGrid();
        return this.render();
      };

      Plugin.prototype.enableFeatures = function() {
        if (this.options.enableResize) {
          return this.enableResize();
        }
      };

      Plugin.prototype.createEvents = function() {
        var _this = this;
        this.$container.off("ss-arrange").on("ss-arrange", function() {
          return _this.arrange();
        });
        return this.$container.off("ss-setState").on("ss-setState", function(e, state) {
          return _this.setState(state);
        });
      };

      Plugin.prototype.setParsedChildren = function() {
        var $child, $children, i, parsedChildren, total, _i;
        $children = this.$container.children(this.options.selector);
        total = $children.length;
        parsedChildren = [];
        for (i = _i = 0; 0 <= total ? _i < total : _i > total; i = 0 <= total ? ++_i : --_i) {
          $child = $($children[i]);
          parsedChildren.push({
            i: i,
            el: $child,
            colspan: parseInt($child.attr("data-ss-colspan")) || 1,
            height: $child.outerHeight()
          });
        }
        return this.parsedChildren = parsedChildren;
      };

      Plugin.prototype.initializeGrid = function() {
        var fc_colspan, fc_width, first_child, gutter_x, single_width;
        gutter_x = this.options.gutterX;
        if (this.options.colWidth) {
          this.grid.col_width = this.options.colWidth + gutter_x;
        } else {
          first_child = this.parsedChildren[0];
          fc_width = first_child.el.outerWidth();
          fc_colspan = first_child.colspan;
          single_width = (fc_width - ((fc_colspan - 1) * gutter_x)) / fc_colspan;
          this.grid.col_width = single_width + gutter_x;
        }
        this.grid.padding_left = parseInt(this.$container.css("padding-left"));
        this.grid.padding_right = parseInt(this.$container.css("padding-right"));
        this.grid.padding_top = parseInt(this.$container.css("padding-top"));
        return this.grid.padding_bottom = parseInt(this.$container.css("padding-bottom"));
      };

      Plugin.prototype.calculateGrid = function() {
        var child_offset, col_width, columns, container_inner_width, grid_width;
        col_width = this.grid.col_width;
        container_inner_width = this.$container.width();
        columns = this.options.columns || Math.floor(container_inner_width / col_width);
        if (columns > this.parsedChildren.length) {
          columns = this.parsedChildren.length;
        }
        this.grid.columns = columns;
        child_offset = this.grid.padding_left;
        grid_width = (columns * col_width) - this.options.gutterX;
        switch (this.options.align) {
          case "center":
            child_offset += (container_inner_width - grid_width) / 2;
            break;
          case "right":
            child_offset += container_inner_width - grid_width;
        }
        return this.grid.child_offset = child_offset;
      };

      Plugin.prototype.getPositions = function() {
        var child, col, col_heights, col_width, columns, gutter_y, i, left, offset_left, padding_top, positions, top, total_children, _i, _j;
        col_width = this.grid.col_width;
        gutter_y = this.options.gutterY;
        padding_top = this.grid.padding_top;
        col_heights = [];
        columns = this.grid.columns;
        for (i = _i = 0; 0 <= columns ? _i < columns : _i > columns; i = 0 <= columns ? ++_i : --_i) {
          col_heights.push(padding_top);
        }
        positions = [];
        total_children = this.parsedChildren.length;
        offset_left = this.grid.child_offset;
        for (i = _j = 0; 0 <= total_children ? _j < total_children : _j > total_children; i = 0 <= total_children ? ++_j : --_j) {
          child = this.parsedChildren[i];
          col = this.lowestCol(col_heights);
          left = (col * col_width) + offset_left;
          top = col_heights[col];
          positions[child.i] = {
            left: left,
            top: top
          };
          col_heights[col] += child.height + gutter_y;
        }
        this.grid.height = this.highestCol(col_heights) - gutter_y - padding_top;
        return positions;
      };

      Plugin.prototype.arrange = function() {
        var $child, animated, i, position, positions, speed, staggeredIntro, state_style, total_children, _i, _results;
        animated = this.state.animated;
        staggeredIntro = this.state.staggeredIntro;
        state_style = this.state.style;
        speed = this.state.speed;
        if (animated && this.options.cssAnimations) {
          animated = false;
        }
        positions = this.getPositions();
        this.$container.css({
          height: this.grid.height
        });
        total_children = this.parsedChildren.length;
        _results = [];
        for (i = _i = 0; 0 <= total_children ? _i < total_children : _i > total_children; i = 0 <= total_children ? ++_i : --_i) {
          $child = this.parsedChildren[i].el;
          position = positions[i];
          if (state_style) {
            $.extend(position, state_style);
          }
          if (staggeredIntro) {
            _results.push(this.stagger(i, $child, position, animated, speed));
          } else {
            _results.push(this.move($child, position, animated, speed));
          }
        }
        return _results;
      };

      Plugin.prototype.stagger = function(i, $child, position, animated, speed) {
        var _this = this;
        return setTimeout(function() {
          return _this.move($child, position, animated, speed);
        }, 20 * i);
      };

      Plugin.prototype.move = function($child, position, animated, speed) {
        if (animated) {
          return $child.stop(true, false).animate(position, speed);
        } else {
          if (this.options.cssAnimations && !this.state.animated) {
            $child.toggleClass('no-transition');
          }
          $child.css(position);
          if (this.options.cssAnimations && !this.state.animated) {
            return setTimeout(function() {
              return $child.toggleClass('no-transition');
            }, 0);
          }
        }
      };

      Plugin.prototype.setState = function(state_name) {
        var state;
        this.state = state = $.extend({}, this.options["states"][state_name]);
        this.arrange();
        return this.state.staggeredIntro = false;
      };

      Plugin.prototype.render = function() {
        this.setState("init");
        return this.setState("normal");
      };

      Plugin.prototype.lowestCol = function(array) {
        return $.inArray(Math.min.apply(window, array), array);
      };

      Plugin.prototype.highestCol = function(array) {
        return array[$.inArray(Math.max.apply(window, array), array)];
      };

      Plugin.prototype.enableResize = function() {
        var resizing,
          _this = this;
        resizing = false;
        return $(window).on("resize", function() {
          var speed;
          if (!resizing) {
            speed = _this.state.speed;
            resizing = true;
            setTimeout(function() {
              _this.calculateGrid();
              return _this.arrange();
            }, speed * .5);
            return setTimeout(function() {
              _this.calculateGrid();
              _this.arrange();
              return resizing = false;
            }, speed * 1.1);
          }
        });
      };

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      });
    };
  })(jQuery, window, document);

}).call(this);
