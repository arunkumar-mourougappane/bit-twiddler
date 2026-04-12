var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/nearley/lib/nearley.js
var require_nearley = __commonJS({
  "node_modules/nearley/lib/nearley.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.nearley = factory();
      }
    })(exports, function() {
      function Rule(name, symbols, postprocess) {
        this.id = ++Rule.highestId;
        this.name = name;
        this.symbols = symbols;
        this.postprocess = postprocess;
        return this;
      }
      Rule.highestId = 0;
      Rule.prototype.toString = function(withCursorAt) {
        var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
        return this.name + " \u2192 " + symbolSequence;
      };
      function State2(rule, dot, reference, wantedBy) {
        this.rule = rule;
        this.dot = dot;
        this.reference = reference;
        this.data = [];
        this.wantedBy = wantedBy;
        this.isComplete = this.dot === rule.symbols.length;
      }
      State2.prototype.toString = function() {
        return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
      };
      State2.prototype.nextState = function(child) {
        var state = new State2(this.rule, this.dot + 1, this.reference, this.wantedBy);
        state.left = this;
        state.right = child;
        if (state.isComplete) {
          state.data = state.build();
          state.right = void 0;
        }
        return state;
      };
      State2.prototype.build = function() {
        var children = [];
        var node = this;
        do {
          children.push(node.right.data);
          node = node.left;
        } while (node.left);
        children.reverse();
        return children;
      };
      State2.prototype.finish = function() {
        if (this.rule.postprocess) {
          this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
        }
      };
      function Column(grammar2, index) {
        this.grammar = grammar2;
        this.index = index;
        this.states = [];
        this.wants = {};
        this.scannable = [];
        this.completed = {};
      }
      Column.prototype.process = function(nextColumn) {
        var states = this.states;
        var wants = this.wants;
        var completed = this.completed;
        for (var w = 0; w < states.length; w++) {
          var state = states[w];
          if (state.isComplete) {
            state.finish();
            if (state.data !== Parser.fail) {
              var wantedBy = state.wantedBy;
              for (var i = wantedBy.length; i--; ) {
                var left = wantedBy[i];
                this.complete(left, state);
              }
              if (state.reference === this.index) {
                var exp = state.rule.name;
                (this.completed[exp] = this.completed[exp] || []).push(state);
              }
            }
          } else {
            var exp = state.rule.symbols[state.dot];
            if (typeof exp !== "string") {
              this.scannable.push(state);
              continue;
            }
            if (wants[exp]) {
              wants[exp].push(state);
              if (completed.hasOwnProperty(exp)) {
                var nulls = completed[exp];
                for (var i = 0; i < nulls.length; i++) {
                  var right = nulls[i];
                  this.complete(state, right);
                }
              }
            } else {
              wants[exp] = [state];
              this.predict(exp);
            }
          }
        }
      };
      Column.prototype.predict = function(exp) {
        var rules = this.grammar.byName[exp] || [];
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          var wantedBy = this.wants[exp];
          var s = new State2(r, 0, this.index, wantedBy);
          this.states.push(s);
        }
      };
      Column.prototype.complete = function(left, right) {
        var copy = left.nextState(right);
        this.states.push(copy);
      };
      function Grammar2(rules, start) {
        this.rules = rules;
        this.start = start || this.rules[0].name;
        var byName = this.byName = {};
        this.rules.forEach(function(rule) {
          if (!byName.hasOwnProperty(rule.name)) {
            byName[rule.name] = [];
          }
          byName[rule.name].push(rule);
        });
      }
      Grammar2.fromCompiled = function(rules, start) {
        var lexer2 = rules.Lexer;
        if (rules.ParserStart) {
          start = rules.ParserStart;
          rules = rules.ParserRules;
        }
        var rules = rules.map(function(r) {
          return new Rule(r.name, r.symbols, r.postprocess);
        });
        var g = new Grammar2(rules, start);
        g.lexer = lexer2;
        return g;
      };
      function StreamLexer() {
        this.reset("");
      }
      StreamLexer.prototype.reset = function(data, state) {
        this.buffer = data;
        this.index = 0;
        this.line = state ? state.line : 1;
        this.lastLineBreak = state ? -state.col : 0;
      };
      StreamLexer.prototype.next = function() {
        if (this.index < this.buffer.length) {
          var ch = this.buffer[this.index++];
          if (ch === "\n") {
            this.line += 1;
            this.lastLineBreak = this.index;
          }
          return { value: ch };
        }
      };
      StreamLexer.prototype.save = function() {
        return {
          line: this.line,
          col: this.index - this.lastLineBreak
        };
      };
      StreamLexer.prototype.formatError = function(token, message) {
        var buffer = this.buffer;
        if (typeof buffer === "string") {
          var lines = buffer.split("\n").slice(
            Math.max(0, this.line - 5),
            this.line
          );
          var nextLineBreak = buffer.indexOf("\n", this.index);
          if (nextLineBreak === -1) nextLineBreak = buffer.length;
          var col = this.index - this.lastLineBreak;
          var lastLineDigits = String(this.line).length;
          message += " at line " + this.line + " col " + col + ":\n\n";
          message += lines.map(function(line, i) {
            return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
          }, this).join("\n");
          message += "\n" + pad("", lastLineDigits + col) + "^\n";
          return message;
        } else {
          return message + " at index " + (this.index - 1);
        }
        function pad(n, length) {
          var s = String(n);
          return Array(length - s.length + 1).join(" ") + s;
        }
      };
      function Parser(rules, start, options) {
        if (rules instanceof Grammar2) {
          var grammar2 = rules;
          var options = start;
        } else {
          var grammar2 = Grammar2.fromCompiled(rules, start);
        }
        this.grammar = grammar2;
        this.options = {
          keepHistory: false,
          lexer: grammar2.lexer || new StreamLexer()
        };
        for (var key in options || {}) {
          this.options[key] = options[key];
        }
        this.lexer = this.options.lexer;
        this.lexerState = void 0;
        var column = new Column(grammar2, 0);
        var table = this.table = [column];
        column.wants[grammar2.start] = [];
        column.predict(grammar2.start);
        column.process();
        this.current = 0;
      }
      Parser.fail = {};
      Parser.prototype.feed = function(chunk) {
        var lexer2 = this.lexer;
        lexer2.reset(chunk, this.lexerState);
        var token;
        while (true) {
          try {
            token = lexer2.next();
            if (!token) {
              break;
            }
          } catch (e) {
            var nextColumn = new Column(this.grammar, this.current + 1);
            this.table.push(nextColumn);
            var err = new Error(this.reportLexerError(e));
            err.offset = this.current;
            err.token = e.token;
            throw err;
          }
          var column = this.table[this.current];
          if (!this.options.keepHistory) {
            delete this.table[this.current - 1];
          }
          var n = this.current + 1;
          var nextColumn = new Column(this.grammar, n);
          this.table.push(nextColumn);
          var literal = token.text !== void 0 ? token.text : token.value;
          var value = lexer2.constructor === StreamLexer ? token.value : token;
          var scannable = column.scannable;
          for (var w = scannable.length; w--; ) {
            var state = scannable[w];
            var expect = state.rule.symbols[state.dot];
            if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
              var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
              nextColumn.states.push(next);
            }
          }
          nextColumn.process();
          if (nextColumn.states.length === 0) {
            var err = new Error(this.reportError(token));
            err.offset = this.current;
            err.token = token;
            throw err;
          }
          if (this.options.keepHistory) {
            column.lexerState = lexer2.save();
          }
          this.current++;
        }
        if (column) {
          this.lexerState = lexer2.save();
        }
        this.results = this.finish();
        return this;
      };
      Parser.prototype.reportLexerError = function(lexerError) {
        var tokenDisplay, lexerMessage;
        var token = lexerError.token;
        if (token) {
          tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
          lexerMessage = this.lexer.formatError(token, "Syntax error");
        } else {
          tokenDisplay = "input (lexer error)";
          lexerMessage = lexerError.message;
        }
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
      };
      Parser.prototype.reportError = function(token) {
        var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
        var lexerMessage = this.lexer.formatError(token, "Syntax error");
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
      };
      Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
        var lines = [];
        lines.push(lexerMessage);
        var lastColumnIndex = this.table.length - 2;
        var lastColumn = this.table[lastColumnIndex];
        var expectantStates = lastColumn.states.filter(function(state) {
          var nextSymbol = state.rule.symbols[state.dot];
          return nextSymbol && typeof nextSymbol !== "string";
        });
        if (expectantStates.length === 0) {
          lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
          this.displayStateStack(lastColumn.states, lines);
        } else {
          lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
          var stateStacks = expectantStates.map(function(state) {
            return this.buildFirstStateStack(state, []) || [state];
          }, this);
          stateStacks.forEach(function(stateStack) {
            var state = stateStack[0];
            var nextSymbol = state.rule.symbols[state.dot];
            var symbolDisplay = this.getSymbolDisplay(nextSymbol);
            lines.push("A " + symbolDisplay + " based on:");
            this.displayStateStack(stateStack, lines);
          }, this);
        }
        lines.push("");
        return lines.join("\n");
      };
      Parser.prototype.displayStateStack = function(stateStack, lines) {
        var lastDisplay;
        var sameDisplayCount = 0;
        for (var j = 0; j < stateStack.length; j++) {
          var state = stateStack[j];
          var display = state.rule.toString(state.dot);
          if (display === lastDisplay) {
            sameDisplayCount++;
          } else {
            if (sameDisplayCount > 0) {
              lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
            }
            sameDisplayCount = 0;
            lines.push("    " + display);
          }
          lastDisplay = display;
        }
      };
      Parser.prototype.getSymbolDisplay = function(symbol) {
        return getSymbolLongDisplay(symbol);
      };
      Parser.prototype.buildFirstStateStack = function(state, visited) {
        if (visited.indexOf(state) !== -1) {
          return null;
        }
        if (state.wantedBy.length === 0) {
          return [state];
        }
        var prevState = state.wantedBy[0];
        var childVisited = [state].concat(visited);
        var childResult = this.buildFirstStateStack(prevState, childVisited);
        if (childResult === null) {
          return null;
        }
        return [state].concat(childResult);
      };
      Parser.prototype.save = function() {
        var column = this.table[this.current];
        column.lexerState = this.lexerState;
        return column;
      };
      Parser.prototype.restore = function(column) {
        var index = column.index;
        this.current = index;
        this.table[index] = column;
        this.table.splice(index + 1);
        this.lexerState = column.lexerState;
        this.results = this.finish();
      };
      Parser.prototype.rewind = function(index) {
        if (!this.options.keepHistory) {
          throw new Error("set option `keepHistory` to enable rewinding");
        }
        this.restore(this.table[index]);
      };
      Parser.prototype.finish = function() {
        var considerations = [];
        var start = this.grammar.start;
        var column = this.table[this.table.length - 1];
        column.states.forEach(function(t) {
          if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
            considerations.push(t);
          }
        });
        return considerations.map(function(c) {
          return c.data;
        });
      };
      function getSymbolLongDisplay(symbol) {
        var type2 = typeof symbol;
        if (type2 === "string") {
          return symbol;
        } else if (type2 === "object") {
          if (symbol.literal) {
            return JSON.stringify(symbol.literal);
          } else if (symbol instanceof RegExp) {
            return "character matching " + symbol;
          } else if (symbol.type) {
            return symbol.type + " token";
          } else if (symbol.test) {
            return "token matching " + String(symbol.test);
          } else {
            throw new Error("Unknown symbol type: " + symbol);
          }
        }
      }
      function getSymbolShortDisplay(symbol) {
        var type2 = typeof symbol;
        if (type2 === "string") {
          return symbol;
        } else if (type2 === "object") {
          if (symbol.literal) {
            return JSON.stringify(symbol.literal);
          } else if (symbol instanceof RegExp) {
            return symbol.toString();
          } else if (symbol.type) {
            return "%" + symbol.type;
          } else if (symbol.test) {
            return "<" + String(symbol.test) + ">";
          } else {
            throw new Error("Unknown symbol type: " + symbol);
          }
        }
      }
      return {
        Parser,
        Grammar: Grammar2,
        Rule
      };
    });
  }
});

// node_modules/cronstrue/dist/cronstrue.js
var require_cronstrue = __commonJS({
  "node_modules/cronstrue/dist/cronstrue.js"(exports, module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define("cronstrue", [], factory);
      else if (typeof exports === "object")
        exports["cronstrue"] = factory();
      else
        root["cronstrue"] = factory();
    })(globalThis, () => {
      return (
        /******/
        (() => {
          "use strict";
          var __webpack_modules__ = {
            /***/
            949(__unused_webpack_module, exports2, __webpack_require__2) {
              Object.defineProperty(exports2, "__esModule", { value: true });
              exports2.CronParser = void 0;
              var rangeValidator_1 = __webpack_require__2(515);
              var CronParser = (function() {
                function CronParser2(expression, dayOfWeekStartIndexZero, monthStartIndexZero) {
                  if (dayOfWeekStartIndexZero === void 0) {
                    dayOfWeekStartIndexZero = true;
                  }
                  if (monthStartIndexZero === void 0) {
                    monthStartIndexZero = false;
                  }
                  this.expression = expression;
                  this.dayOfWeekStartIndexZero = dayOfWeekStartIndexZero;
                  this.monthStartIndexZero = monthStartIndexZero;
                }
                CronParser2.prototype.parse = function() {
                  var _a;
                  var parsed;
                  var expression = (_a = this.expression) !== null && _a !== void 0 ? _a : "";
                  if (expression === "@reboot") {
                    parsed = ["@reboot", "", "", "", "", "", ""];
                    return parsed;
                  } else if (expression.startsWith("@")) {
                    var special = this.parseSpecial(this.expression);
                    parsed = this.extractParts(special);
                  } else {
                    parsed = this.extractParts(this.expression);
                  }
                  this.normalize(parsed);
                  this.validate(parsed);
                  return parsed;
                };
                CronParser2.prototype.parseSpecial = function(expression) {
                  var specialExpressions = {
                    "@yearly": "0 0 1 1 *",
                    "@annually": "0 0 1 1 *",
                    "@monthly": "0 0 1 * *",
                    "@weekly": "0 0 * * 0",
                    "@daily": "0 0 * * *",
                    "@midnight": "0 0 * * *",
                    "@hourly": "0 * * * *",
                    "@reboot": "@reboot"
                  };
                  var special = specialExpressions[expression];
                  if (!special) {
                    throw new Error("Unknown special expression.");
                  }
                  return special;
                };
                CronParser2.prototype.extractParts = function(expression) {
                  if (!this.expression) {
                    throw new Error("cron expression is empty");
                  }
                  var parsed = expression.trim().split(/[ ]+/);
                  for (var i = 0; i < parsed.length; i++) {
                    if (parsed[i].includes(",")) {
                      var arrayElement = parsed[i].split(",").map(function(item) {
                        return item.trim();
                      }).filter(function(item) {
                        return item !== "";
                      }).map(function(item) {
                        return !isNaN(Number(item)) ? Number(item) : item;
                      }).filter(function(item) {
                        return item !== null && item !== "";
                      });
                      if (arrayElement.length === 0) {
                        arrayElement.push("*");
                      }
                      arrayElement.sort(function(a, b) {
                        return a !== null && b !== null ? a - b : 0;
                      });
                      parsed[i] = arrayElement.map(function(item) {
                        return item !== null ? item.toString() : "";
                      }).join(",");
                    }
                  }
                  if (parsed.length < 5) {
                    throw new Error("Expression has only ".concat(parsed.length, " part").concat(parsed.length == 1 ? "" : "s", ". At least 5 parts are required."));
                  } else if (parsed.length == 5) {
                    parsed.unshift("");
                    parsed.push("");
                  } else if (parsed.length == 6) {
                    var isYearWithNoSecondsPart = /\d{4}$/.test(parsed[5]) || parsed[4] == "?" || parsed[2] == "?";
                    if (isYearWithNoSecondsPart) {
                      parsed.unshift("");
                    } else {
                      parsed.push("");
                    }
                  } else if (parsed.length > 7) {
                    throw new Error("Expression has ".concat(parsed.length, " parts; too many!"));
                  }
                  return parsed;
                };
                CronParser2.prototype.normalize = function(expressionParts) {
                  var _this = this;
                  expressionParts[3] = expressionParts[3].replace("?", "*");
                  expressionParts[5] = expressionParts[5].replace("?", "*");
                  expressionParts[2] = expressionParts[2].replace("?", "*");
                  if (expressionParts[0].indexOf("0/") == 0) {
                    expressionParts[0] = expressionParts[0].replace("0/", "*/");
                  }
                  if (expressionParts[1].indexOf("0/") == 0) {
                    expressionParts[1] = expressionParts[1].replace("0/", "*/");
                  }
                  if (expressionParts[2].indexOf("0/") == 0) {
                    expressionParts[2] = expressionParts[2].replace("0/", "*/");
                  }
                  if (expressionParts[3].indexOf("1/") == 0) {
                    expressionParts[3] = expressionParts[3].replace("1/", "*/");
                  }
                  if (expressionParts[4].indexOf("1/") == 0) {
                    expressionParts[4] = expressionParts[4].replace("1/", "*/");
                  }
                  if (expressionParts[6].indexOf("1/") == 0) {
                    expressionParts[6] = expressionParts[6].replace("1/", "*/");
                  }
                  expressionParts[5] = expressionParts[5].replace(/(^\d)|([^#/\s]\d)/g, function(t) {
                    var dowDigits = t.replace(/\D/, "");
                    var dowDigitsAdjusted = dowDigits;
                    if (_this.dayOfWeekStartIndexZero) {
                      if (dowDigits == "7") {
                        dowDigitsAdjusted = "0";
                      }
                    } else {
                      dowDigitsAdjusted = (parseInt(dowDigits) - 1).toString();
                    }
                    return t.replace(dowDigits, dowDigitsAdjusted);
                  });
                  if (expressionParts[5] == "L") {
                    expressionParts[5] = "6";
                  }
                  if (expressionParts[3] == "?") {
                    expressionParts[3] = "*";
                  }
                  if (expressionParts[3].indexOf("W") > -1 && (expressionParts[3].indexOf(",") > -1 || expressionParts[3].indexOf("-") > -1)) {
                    throw new Error("The 'W' character can be specified only when the day-of-month is a single day, not a range or list of days.");
                  }
                  var days = {
                    SUN: 0,
                    MON: 1,
                    TUE: 2,
                    WED: 3,
                    THU: 4,
                    FRI: 5,
                    SAT: 6
                  };
                  for (var day in days) {
                    expressionParts[5] = expressionParts[5].replace(new RegExp(day, "gi"), days[day].toString());
                  }
                  expressionParts[4] = expressionParts[4].replace(/(^\d{1,2})|([^#/\s]\d{1,2})/g, function(t) {
                    var dowDigits = t.replace(/\D/, "");
                    var dowDigitsAdjusted = dowDigits;
                    if (_this.monthStartIndexZero) {
                      dowDigitsAdjusted = (parseInt(dowDigits) + 1).toString();
                    }
                    return t.replace(dowDigits, dowDigitsAdjusted);
                  });
                  var months = {
                    JAN: 1,
                    FEB: 2,
                    MAR: 3,
                    APR: 4,
                    MAY: 5,
                    JUN: 6,
                    JUL: 7,
                    AUG: 8,
                    SEP: 9,
                    OCT: 10,
                    NOV: 11,
                    DEC: 12
                  };
                  for (var month in months) {
                    expressionParts[4] = expressionParts[4].replace(new RegExp(month, "gi"), months[month].toString());
                  }
                  if (expressionParts[0] == "0") {
                    expressionParts[0] = "";
                  }
                  if (!/\*|\-|\,|\//.test(expressionParts[2]) && (/\*|\//.test(expressionParts[1]) || /\*|\//.test(expressionParts[0]))) {
                    expressionParts[2] += "-".concat(expressionParts[2]);
                  }
                  for (var i = 0; i < expressionParts.length; i++) {
                    if (expressionParts[i].indexOf(",") != -1) {
                      expressionParts[i] = expressionParts[i].split(",").filter(function(str2) {
                        return str2 !== "";
                      }).join(",") || "*";
                    }
                    if (expressionParts[i] == "*/1") {
                      expressionParts[i] = "*";
                    }
                    if (expressionParts[i].indexOf("/") > -1 && !/^\*|\-|\,/.test(expressionParts[i])) {
                      var stepRangeThrough = null;
                      switch (i) {
                        case 4:
                          stepRangeThrough = "12";
                          break;
                        case 5:
                          stepRangeThrough = "6";
                          break;
                        case 6:
                          stepRangeThrough = "9999";
                          break;
                        default:
                          stepRangeThrough = null;
                          break;
                      }
                      if (stepRangeThrough !== null) {
                        var parts = expressionParts[i].split("/");
                        expressionParts[i] = "".concat(parts[0], "-").concat(stepRangeThrough, "/").concat(parts[1]);
                      }
                    }
                  }
                };
                CronParser2.prototype.validate = function(parsed) {
                  var standardCronPartCharacters = "0-9,\\-*/";
                  this.validateOnlyExpectedCharactersFound(parsed[0], standardCronPartCharacters);
                  this.validateOnlyExpectedCharactersFound(parsed[1], standardCronPartCharacters);
                  this.validateOnlyExpectedCharactersFound(parsed[2], standardCronPartCharacters);
                  this.validateOnlyExpectedCharactersFound(parsed[3], "0-9,\\-*/LW");
                  this.validateOnlyExpectedCharactersFound(parsed[4], standardCronPartCharacters);
                  this.validateOnlyExpectedCharactersFound(parsed[5], "0-9,\\-*/L#");
                  this.validateOnlyExpectedCharactersFound(parsed[6], standardCronPartCharacters);
                  this.validateAnyRanges(parsed);
                };
                CronParser2.prototype.validateAnyRanges = function(parsed) {
                  rangeValidator_1.default.secondRange(parsed[0]);
                  rangeValidator_1.default.minuteRange(parsed[1]);
                  rangeValidator_1.default.hourRange(parsed[2]);
                  rangeValidator_1.default.dayOfMonthRange(parsed[3]);
                  rangeValidator_1.default.monthRange(parsed[4], this.monthStartIndexZero);
                  rangeValidator_1.default.dayOfWeekRange(parsed[5], this.dayOfWeekStartIndexZero);
                };
                CronParser2.prototype.validateOnlyExpectedCharactersFound = function(cronPart, allowedCharsExpression) {
                  var invalidChars = cronPart.match(new RegExp("[^".concat(allowedCharsExpression, "]+"), "gi"));
                  if (invalidChars && invalidChars.length) {
                    throw new Error("Expression contains invalid values: '".concat(invalidChars.toString(), "'"));
                  }
                };
                return CronParser2;
              })();
              exports2.CronParser = CronParser;
            },
            /***/
            333(__unused_webpack_module, exports2, __webpack_require__2) {
              Object.defineProperty(exports2, "__esModule", { value: true });
              exports2.ExpressionDescriptor = void 0;
              var stringUtilities_1 = __webpack_require__2(823);
              var cronParser_1 = __webpack_require__2(949);
              var ExpressionDescriptor = (function() {
                function ExpressionDescriptor2(expression, options) {
                  this.expression = expression;
                  this.options = options;
                  this.expressionParts = new Array(5);
                  if (!this.options.locale && ExpressionDescriptor2.defaultLocale) {
                    this.options.locale = ExpressionDescriptor2.defaultLocale;
                  }
                  if (!ExpressionDescriptor2.locales[this.options.locale]) {
                    var fallBackLocale = Object.keys(ExpressionDescriptor2.locales)[0];
                    console.warn("Locale '".concat(this.options.locale, "' could not be found; falling back to '").concat(fallBackLocale, "'."));
                    this.options.locale = fallBackLocale;
                  }
                  this.i18n = ExpressionDescriptor2.locales[this.options.locale];
                  if (options.use24HourTimeFormat === void 0) {
                    options.use24HourTimeFormat = this.i18n.use24HourTimeFormatByDefault();
                  }
                }
                ExpressionDescriptor2.toString = function(expression, _a) {
                  var _b = _a === void 0 ? {} : _a, _c = _b.throwExceptionOnParseError, throwExceptionOnParseError = _c === void 0 ? true : _c, _d = _b.verbose, verbose = _d === void 0 ? false : _d, _e = _b.dayOfWeekStartIndexZero, dayOfWeekStartIndexZero = _e === void 0 ? true : _e, _f = _b.monthStartIndexZero, monthStartIndexZero = _f === void 0 ? false : _f, use24HourTimeFormat = _b.use24HourTimeFormat, _g = _b.trimHoursLeadingZero, trimHoursLeadingZero = _g === void 0 ? false : _g, _h = _b.locale, locale = _h === void 0 ? null : _h, _j = _b.logicalAndDayFields, logicalAndDayFields = _j === void 0 ? false : _j;
                  var options = {
                    throwExceptionOnParseError,
                    verbose,
                    dayOfWeekStartIndexZero,
                    monthStartIndexZero,
                    use24HourTimeFormat,
                    trimHoursLeadingZero,
                    locale,
                    logicalAndDayFields
                  };
                  if (options.tzOffset) {
                    console.warn("'tzOffset' option has been deprecated and is no longer supported.");
                  }
                  var descripter = new ExpressionDescriptor2(expression, options);
                  return descripter.getFullDescription();
                };
                ExpressionDescriptor2.initialize = function(localesLoader, defaultLocale) {
                  if (defaultLocale === void 0) {
                    defaultLocale = "en";
                  }
                  ExpressionDescriptor2.specialCharacters = ["/", "-", ",", "*"];
                  ExpressionDescriptor2.defaultLocale = defaultLocale;
                  localesLoader.load(ExpressionDescriptor2.locales);
                };
                ExpressionDescriptor2.prototype.getFullDescription = function() {
                  var _a, _b;
                  var description = "";
                  try {
                    var parser = new cronParser_1.CronParser(this.expression, this.options.dayOfWeekStartIndexZero, this.options.monthStartIndexZero);
                    this.expressionParts = parser.parse();
                    if (this.expressionParts[0] === "@reboot") {
                      return ((_b = (_a = this.i18n).atReboot) === null || _b === void 0 ? void 0 : _b.call(_a)) || "Run once, at startup";
                    }
                    var timeSegment = this.getTimeOfDayDescription();
                    var dayOfMonthDesc = this.getDayOfMonthDescription();
                    var monthDesc = this.getMonthDescription();
                    var dayOfWeekDesc = this.getDayOfWeekDescription();
                    var yearDesc = this.getYearDescription();
                    description += timeSegment + dayOfMonthDesc + dayOfWeekDesc + monthDesc + yearDesc;
                    description = this.transformVerbosity(description, !!this.options.verbose);
                    description = description.charAt(0).toLocaleUpperCase() + description.substr(1);
                  } catch (ex) {
                    if (!this.options.throwExceptionOnParseError) {
                      description = this.i18n.anErrorOccuredWhenGeneratingTheExpressionD();
                    } else {
                      throw "".concat(ex);
                    }
                  }
                  return description;
                };
                ExpressionDescriptor2.prototype.getTimeOfDayDescription = function() {
                  var secondsExpression = this.expressionParts[0];
                  var minuteExpression = this.expressionParts[1];
                  var hourExpression = this.expressionParts[2];
                  var description = "";
                  if (!stringUtilities_1.StringUtilities.containsAny(minuteExpression, ExpressionDescriptor2.specialCharacters) && !stringUtilities_1.StringUtilities.containsAny(hourExpression, ExpressionDescriptor2.specialCharacters) && !stringUtilities_1.StringUtilities.containsAny(secondsExpression, ExpressionDescriptor2.specialCharacters)) {
                    description += this.i18n.atSpace() + this.formatTime(hourExpression, minuteExpression, secondsExpression);
                  } else if (!secondsExpression && minuteExpression.indexOf("-") > -1 && !(minuteExpression.indexOf(",") > -1) && !(minuteExpression.indexOf("/") > -1) && !stringUtilities_1.StringUtilities.containsAny(hourExpression, ExpressionDescriptor2.specialCharacters)) {
                    var minuteParts = minuteExpression.split("-");
                    description += stringUtilities_1.StringUtilities.format(this.i18n.everyMinuteBetweenX0AndX1(), this.formatTime(hourExpression, minuteParts[0], ""), this.formatTime(hourExpression, minuteParts[1], ""));
                  } else if (!secondsExpression && hourExpression.indexOf(",") > -1 && hourExpression.indexOf("-") == -1 && hourExpression.indexOf("/") == -1 && !stringUtilities_1.StringUtilities.containsAny(minuteExpression, ExpressionDescriptor2.specialCharacters)) {
                    var hourParts = hourExpression.split(",");
                    description += this.i18n.at();
                    for (var i = 0; i < hourParts.length; i++) {
                      description += " ";
                      description += this.formatTime(hourParts[i], minuteExpression, "");
                      if (i < hourParts.length - 2) {
                        description += ",";
                      }
                      if (i == hourParts.length - 2) {
                        description += this.i18n.spaceAnd();
                      }
                    }
                  } else {
                    var secondsDescription = this.getSecondsDescription();
                    var minutesDescription = this.getMinutesDescription();
                    var hoursDescription = this.getHoursDescription();
                    description += secondsDescription;
                    if (description && minutesDescription) {
                      description += ", ";
                    }
                    description += minutesDescription;
                    if (minutesDescription === hoursDescription) {
                      return description;
                    }
                    if (description && hoursDescription) {
                      description += ", ";
                    }
                    description += hoursDescription;
                  }
                  return description;
                };
                ExpressionDescriptor2.prototype.getSecondsDescription = function() {
                  var _this = this;
                  var description = this.getSegmentDescription(this.expressionParts[0], this.i18n.everySecond(), function(s) {
                    return s;
                  }, function(s) {
                    return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Seconds(s), s);
                  }, function(s) {
                    return _this.i18n.secondsX0ThroughX1PastTheMinute();
                  }, function(s) {
                    return s == "0" ? "" : parseInt(s) < 20 ? _this.i18n.atX0SecondsPastTheMinute(s) : _this.i18n.atX0SecondsPastTheMinuteGt20() || _this.i18n.atX0SecondsPastTheMinute(s);
                  });
                  return description;
                };
                ExpressionDescriptor2.prototype.getMinutesDescription = function() {
                  var _this = this;
                  var secondsExpression = this.expressionParts[0];
                  var hourExpression = this.expressionParts[2];
                  var description = this.getSegmentDescription(this.expressionParts[1], this.i18n.everyMinute(), function(s) {
                    return s;
                  }, function(s) {
                    return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Minutes(s), s);
                  }, function(s) {
                    return _this.i18n.minutesX0ThroughX1PastTheHour();
                  }, function(s) {
                    var _a, _b;
                    try {
                      return s == "0" && hourExpression.indexOf("/") == -1 && secondsExpression == "" ? _this.i18n.everyHour() : s == "0" ? ((_b = (_a = _this.i18n).onTheHour) === null || _b === void 0 ? void 0 : _b.call(_a)) || _this.i18n.atX0MinutesPastTheHour(s) : parseInt(s) < 20 ? _this.i18n.atX0MinutesPastTheHour(s) : _this.i18n.atX0MinutesPastTheHourGt20() || _this.i18n.atX0MinutesPastTheHour(s);
                    } catch (e) {
                      return _this.i18n.atX0MinutesPastTheHour(s);
                    }
                  });
                  return description;
                };
                ExpressionDescriptor2.prototype.getHoursDescription = function() {
                  var _this = this;
                  var expression = this.expressionParts[2];
                  var hourIndex = 0;
                  var rangeEndValues = [];
                  expression.split("/")[0].split(",").forEach(function(range) {
                    var rangeParts = range.split("-");
                    if (rangeParts.length === 2) {
                      rangeEndValues.push({ value: rangeParts[1], index: hourIndex + 1 });
                    }
                    hourIndex += rangeParts.length;
                  });
                  var evaluationIndex = 0;
                  var description = this.getSegmentDescription(expression, this.i18n.everyHour(), function(s) {
                    var match = rangeEndValues.find(function(r) {
                      return r.value === s && r.index === evaluationIndex;
                    });
                    var isRangeEndWithNonZeroMinute = match && _this.expressionParts[1] !== "0";
                    evaluationIndex++;
                    return isRangeEndWithNonZeroMinute ? _this.formatTime(s, "59", "") : _this.formatTime(s, "0", "");
                  }, function(s) {
                    return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Hours(s), s);
                  }, function(s) {
                    return _this.i18n.betweenX0AndX1();
                  }, function(s) {
                    return _this.i18n.atX0();
                  });
                  return description;
                };
                ExpressionDescriptor2.prototype.getDayOfWeekDescription = function() {
                  var _this = this;
                  var daysOfWeekNames = this.i18n.daysOfTheWeek();
                  var description = null;
                  if (this.expressionParts[5] == "*") {
                    description = "";
                  } else {
                    description = this.getSegmentDescription(this.expressionParts[5], this.i18n.commaEveryDay(), function(s, form) {
                      var exp = s;
                      if (s.indexOf("#") > -1) {
                        exp = s.substring(0, s.indexOf("#"));
                      } else if (s.indexOf("L") > -1) {
                        exp = exp.replace("L", "");
                      }
                      var parsedExp = parseInt(exp);
                      var description2 = _this.i18n.daysOfTheWeekInCase ? _this.i18n.daysOfTheWeekInCase(form)[parsedExp] : daysOfWeekNames[parsedExp];
                      if (s.indexOf("#") > -1) {
                        var dayOfWeekOfMonthDescription = null;
                        var dayOfWeekOfMonthNumber = s.substring(s.indexOf("#") + 1);
                        var dayOfWeekNumber = s.substring(0, s.indexOf("#"));
                        switch (dayOfWeekOfMonthNumber) {
                          case "1":
                            dayOfWeekOfMonthDescription = _this.i18n.first(dayOfWeekNumber);
                            break;
                          case "2":
                            dayOfWeekOfMonthDescription = _this.i18n.second(dayOfWeekNumber);
                            break;
                          case "3":
                            dayOfWeekOfMonthDescription = _this.i18n.third(dayOfWeekNumber);
                            break;
                          case "4":
                            dayOfWeekOfMonthDescription = _this.i18n.fourth(dayOfWeekNumber);
                            break;
                          case "5":
                            dayOfWeekOfMonthDescription = _this.i18n.fifth(dayOfWeekNumber);
                            break;
                        }
                        description2 = dayOfWeekOfMonthDescription + " " + description2;
                      }
                      return description2;
                    }, function(s) {
                      if (parseInt(s) == 1) {
                        return "";
                      } else {
                        return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0DaysOfTheWeek(s), s);
                      }
                    }, function(s) {
                      var beginFrom = s.substring(0, s.indexOf("-"));
                      var domSpecified = _this.expressionParts[3] != "*";
                      return domSpecified ? _this.i18n.commaAndX0ThroughX1(beginFrom) : _this.i18n.commaX0ThroughX1(beginFrom);
                    }, function(s) {
                      var format2 = null;
                      if (s.indexOf("#") > -1) {
                        var dayOfWeekOfMonthNumber = s.substring(s.indexOf("#") + 1);
                        var dayOfWeek = s.substring(0, s.indexOf("#"));
                        format2 = _this.i18n.commaOnThe(dayOfWeekOfMonthNumber, dayOfWeek).trim() + _this.i18n.spaceX0OfTheMonth();
                      } else if (s.indexOf("L") > -1) {
                        format2 = _this.i18n.commaOnTheLastX0OfTheMonth(s.replace("L", ""));
                      } else {
                        var domSpecified = _this.expressionParts[3] != "*";
                        if (!domSpecified) {
                          format2 = _this.i18n.commaOnlyOnX0(s);
                        } else if (_this.options.logicalAndDayFields) {
                          format2 = _this.i18n.commaOnlyOnX0(s);
                        } else {
                          format2 = _this.i18n.commaAndOnX0();
                        }
                      }
                      return format2;
                    });
                  }
                  return description;
                };
                ExpressionDescriptor2.prototype.getMonthDescription = function() {
                  var _this = this;
                  var monthNames = this.i18n.monthsOfTheYear();
                  var description = this.getSegmentDescription(this.expressionParts[4], "", function(s, form) {
                    return form && _this.i18n.monthsOfTheYearInCase ? _this.i18n.monthsOfTheYearInCase(form)[parseInt(s) - 1] : monthNames[parseInt(s) - 1];
                  }, function(s) {
                    if (parseInt(s) == 1) {
                      return "";
                    } else {
                      return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0Months(s), s);
                    }
                  }, function(s) {
                    return _this.i18n.commaMonthX0ThroughMonthX1() || _this.i18n.commaX0ThroughX1();
                  }, function(s) {
                    return _this.i18n.commaOnlyInMonthX0 ? _this.i18n.commaOnlyInMonthX0() : _this.i18n.commaOnlyInX0();
                  });
                  return description;
                };
                ExpressionDescriptor2.prototype.getDayOfMonthDescription = function() {
                  var _this = this;
                  var description = null;
                  var expression = this.expressionParts[3];
                  switch (expression) {
                    case "L":
                      description = this.i18n.commaOnTheLastDayOfTheMonth();
                      break;
                    case "WL":
                    case "LW":
                      description = this.i18n.commaOnTheLastWeekdayOfTheMonth();
                      break;
                    default:
                      var weekDayNumberMatches = expression.match(/(\d{1,2}W)|(W\d{1,2})/);
                      if (weekDayNumberMatches) {
                        var dayNumber = parseInt(weekDayNumberMatches[0].replace("W", ""));
                        var dayString = dayNumber == 1 ? this.i18n.firstWeekday() : stringUtilities_1.StringUtilities.format(this.i18n.weekdayNearestDayX0(), dayNumber.toString());
                        description = stringUtilities_1.StringUtilities.format(this.i18n.commaOnTheX0OfTheMonth(), dayString);
                        break;
                      } else {
                        var lastDayOffSetMatches = expression.match(/L-(\d{1,2})/);
                        if (lastDayOffSetMatches) {
                          var offSetDays = lastDayOffSetMatches[1];
                          description = stringUtilities_1.StringUtilities.format(this.i18n.commaDaysBeforeTheLastDayOfTheMonth(offSetDays), offSetDays);
                          break;
                        } else if (expression == "*" && this.expressionParts[5] != "*") {
                          return "";
                        } else {
                          description = this.getSegmentDescription(expression, this.i18n.commaEveryDay(), function(s) {
                            return s == "L" ? _this.i18n.lastDay() : _this.i18n.dayX0 ? stringUtilities_1.StringUtilities.format(_this.i18n.dayX0(), s) : s;
                          }, function(s) {
                            return s == "1" ? _this.i18n.commaEveryDay() : _this.i18n.commaEveryX0Days(s);
                          }, function(s) {
                            return _this.i18n.commaBetweenDayX0AndX1OfTheMonth(s);
                          }, function(s) {
                            return _this.i18n.commaOnDayX0OfTheMonth(s);
                          });
                        }
                        break;
                      }
                  }
                  return description;
                };
                ExpressionDescriptor2.prototype.getYearDescription = function() {
                  var _this = this;
                  var description = this.getSegmentDescription(this.expressionParts[6], "", function(s) {
                    return /^\d+$/.test(s) ? new Date(parseInt(s), 1).getFullYear().toString() : s;
                  }, function(s) {
                    return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0Years(s), s);
                  }, function(s) {
                    return _this.i18n.commaYearX0ThroughYearX1() || _this.i18n.commaX0ThroughX1();
                  }, function(s) {
                    return _this.i18n.commaOnlyInYearX0 ? _this.i18n.commaOnlyInYearX0() : _this.i18n.commaOnlyInX0();
                  });
                  return description;
                };
                ExpressionDescriptor2.prototype.getSegmentDescription = function(expression, allDescription, getSingleItemDescription, getIncrementDescriptionFormat, getRangeDescriptionFormat, getDescriptionFormat) {
                  var description = null;
                  var doesExpressionContainIncrement = expression.indexOf("/") > -1;
                  var doesExpressionContainRange = expression.indexOf("-") > -1;
                  var doesExpressionContainMultipleValues = expression.indexOf(",") > -1;
                  if (!expression) {
                    description = "";
                  } else if (expression === "*") {
                    description = allDescription;
                  } else if (!doesExpressionContainIncrement && !doesExpressionContainRange && !doesExpressionContainMultipleValues) {
                    description = stringUtilities_1.StringUtilities.format(getDescriptionFormat(expression), getSingleItemDescription(expression));
                  } else if (doesExpressionContainMultipleValues) {
                    var segments = expression.split(",");
                    var descriptionContent = "";
                    for (var i = 0; i < segments.length; i++) {
                      if (i > 0 && segments.length > 2) {
                        descriptionContent += ",";
                        if (i < segments.length - 1) {
                          descriptionContent += " ";
                        }
                      }
                      if (i > 0 && segments.length > 1 && (i == segments.length - 1 || segments.length == 2)) {
                        descriptionContent += "".concat(this.i18n.spaceAnd(), " ");
                      }
                      if (segments[i].indexOf("/") > -1 || segments[i].indexOf("-") > -1) {
                        var isSegmentRangeWithoutIncrement = segments[i].indexOf("-") > -1 && segments[i].indexOf("/") == -1;
                        var currentDescriptionContent = this.getSegmentDescription(segments[i], allDescription, getSingleItemDescription, getIncrementDescriptionFormat, isSegmentRangeWithoutIncrement ? this.i18n.commaX0ThroughX1 : getRangeDescriptionFormat, getDescriptionFormat);
                        if (isSegmentRangeWithoutIncrement) {
                          currentDescriptionContent = currentDescriptionContent.replace(", ", "");
                        }
                        descriptionContent += currentDescriptionContent;
                      } else if (!doesExpressionContainIncrement) {
                        descriptionContent += getSingleItemDescription(segments[i]);
                      } else {
                        var segmentDescription = this.getSegmentDescription(segments[i], allDescription, getSingleItemDescription, getIncrementDescriptionFormat, getRangeDescriptionFormat, getDescriptionFormat);
                        if (segmentDescription && segmentDescription.startsWith(", ")) {
                          segmentDescription = segmentDescription.substring(2);
                        }
                        descriptionContent += segmentDescription;
                      }
                    }
                    if (!doesExpressionContainIncrement) {
                      description = stringUtilities_1.StringUtilities.format(getDescriptionFormat(expression), descriptionContent);
                    } else {
                      description = descriptionContent;
                    }
                  } else if (doesExpressionContainIncrement) {
                    var segments = expression.split("/");
                    description = stringUtilities_1.StringUtilities.format(getIncrementDescriptionFormat(segments[1]), segments[1]);
                    if (segments[0].indexOf("-") > -1) {
                      var rangeSegmentDescription = this.generateRangeSegmentDescription(segments[0], getRangeDescriptionFormat, getSingleItemDescription);
                      if (rangeSegmentDescription.indexOf(", ") != 0) {
                        description += ", ";
                      }
                      description += rangeSegmentDescription;
                    } else if (segments[0].indexOf("*") == -1) {
                      var rangeItemDescription = stringUtilities_1.StringUtilities.format(getDescriptionFormat(segments[0]), getSingleItemDescription(segments[0]));
                      rangeItemDescription = rangeItemDescription.replace(", ", "");
                      description += stringUtilities_1.StringUtilities.format(this.i18n.commaStartingX0(), rangeItemDescription);
                    }
                  } else if (doesExpressionContainRange) {
                    description = this.generateRangeSegmentDescription(expression, getRangeDescriptionFormat, getSingleItemDescription);
                  }
                  return description;
                };
                ExpressionDescriptor2.prototype.generateRangeSegmentDescription = function(rangeExpression, getRangeDescriptionFormat, getSingleItemDescription) {
                  var description = "";
                  var rangeSegments = rangeExpression.split("-");
                  var rangeSegment1Description = getSingleItemDescription(rangeSegments[0], 1);
                  var rangeSegment2Description = getSingleItemDescription(rangeSegments[1], 2);
                  var rangeDescriptionFormat = getRangeDescriptionFormat(rangeExpression);
                  description += stringUtilities_1.StringUtilities.format(rangeDescriptionFormat, rangeSegment1Description, rangeSegment2Description);
                  return description;
                };
                ExpressionDescriptor2.prototype.formatTime = function(hourExpression, minuteExpression, secondExpression) {
                  var hourOffset = 0;
                  var minuteOffset = 0;
                  var hour = parseInt(hourExpression) + hourOffset;
                  var minute = parseInt(minuteExpression) + minuteOffset;
                  if (minute >= 60) {
                    minute -= 60;
                    hour += 1;
                  } else if (minute < 0) {
                    minute += 60;
                    hour -= 1;
                  }
                  if (hour >= 24) {
                    hour = hour - 24;
                  } else if (hour < 0) {
                    hour = 24 + hour;
                  }
                  var period = "";
                  var setPeriodBeforeTime = false;
                  if (!this.options.use24HourTimeFormat) {
                    setPeriodBeforeTime = !!(this.i18n.setPeriodBeforeTime && this.i18n.setPeriodBeforeTime());
                    period = setPeriodBeforeTime ? "".concat(this.getPeriod(hour), " ") : " ".concat(this.getPeriod(hour));
                    if (hour > 12) {
                      hour -= 12;
                    }
                    if (hour === 0) {
                      hour = 12;
                    }
                  }
                  var second = "";
                  if (secondExpression) {
                    second = ":".concat(("00" + secondExpression).substring(secondExpression.length));
                  }
                  var hourStr = hour.toString();
                  var paddedHour = ("00" + hourStr).substring(hourStr.length);
                  var minuteStr = minute.toString();
                  var paddedMinute = ("00" + minuteStr).substring(minuteStr.length);
                  var displayHour = this.options.trimHoursLeadingZero ? hourStr : paddedHour;
                  return "".concat(setPeriodBeforeTime ? period : "").concat(displayHour, ":").concat(paddedMinute).concat(second).concat(!setPeriodBeforeTime ? period : "");
                };
                ExpressionDescriptor2.prototype.transformVerbosity = function(description, useVerboseFormat) {
                  if (!useVerboseFormat) {
                    description = description.replace(new RegExp(", ".concat(this.i18n.everyMinute()), "g"), "");
                    description = description.replace(new RegExp(", ".concat(this.i18n.everyHour()), "g"), "");
                    description = description.replace(new RegExp(this.i18n.commaEveryDay(), "g"), "");
                    description = description.replace(/\, ?$/, "");
                    if (this.i18n.conciseVerbosityReplacements) {
                      for (var _i = 0, _a = Object.entries(this.i18n.conciseVerbosityReplacements()); _i < _a.length; _i++) {
                        var _b = _a[_i], key = _b[0], value = _b[1];
                        description = description.replace(new RegExp(key, "g"), value);
                      }
                    }
                  }
                  return description;
                };
                ExpressionDescriptor2.prototype.getPeriod = function(hour) {
                  return hour >= 12 ? this.i18n.pm && this.i18n.pm() || "PM" : this.i18n.am && this.i18n.am() || "AM";
                };
                ExpressionDescriptor2.locales = {};
                return ExpressionDescriptor2;
              })();
              exports2.ExpressionDescriptor = ExpressionDescriptor;
            },
            /***/
            747(__unused_webpack_module, exports2, __webpack_require__2) {
              Object.defineProperty(exports2, "__esModule", { value: true });
              exports2.enLocaleLoader = void 0;
              var en_1 = __webpack_require__2(486);
              var enLocaleLoader = (function() {
                function enLocaleLoader2() {
                }
                enLocaleLoader2.prototype.load = function(availableLocales) {
                  availableLocales["en"] = new en_1.en();
                };
                return enLocaleLoader2;
              })();
              exports2.enLocaleLoader = enLocaleLoader;
            },
            /***/
            486(__unused_webpack_module, exports2) {
              Object.defineProperty(exports2, "__esModule", { value: true });
              exports2.en = void 0;
              var en = (function() {
                function en2() {
                }
                en2.prototype.atX0SecondsPastTheMinuteGt20 = function() {
                  return null;
                };
                en2.prototype.atX0MinutesPastTheHourGt20 = function() {
                  return null;
                };
                en2.prototype.commaMonthX0ThroughMonthX1 = function() {
                  return null;
                };
                en2.prototype.commaYearX0ThroughYearX1 = function() {
                  return null;
                };
                en2.prototype.use24HourTimeFormatByDefault = function() {
                  return false;
                };
                en2.prototype.anErrorOccuredWhenGeneratingTheExpressionD = function() {
                  return "An error occurred when generating the expression description. Check the cron expression syntax.";
                };
                en2.prototype.everyMinute = function() {
                  return "every minute";
                };
                en2.prototype.everyHour = function() {
                  return "every hour";
                };
                en2.prototype.atSpace = function() {
                  return "At ";
                };
                en2.prototype.everyMinuteBetweenX0AndX1 = function() {
                  return "Every minute between %s and %s";
                };
                en2.prototype.at = function() {
                  return "At";
                };
                en2.prototype.spaceAnd = function() {
                  return " and";
                };
                en2.prototype.everySecond = function() {
                  return "every second";
                };
                en2.prototype.everyX0Seconds = function() {
                  return "every %s seconds";
                };
                en2.prototype.secondsX0ThroughX1PastTheMinute = function() {
                  return "seconds %s through %s past the minute";
                };
                en2.prototype.atX0SecondsPastTheMinute = function() {
                  return "at %s seconds past the minute";
                };
                en2.prototype.everyX0Minutes = function() {
                  return "every %s minutes";
                };
                en2.prototype.minutesX0ThroughX1PastTheHour = function() {
                  return "minutes %s through %s past the hour";
                };
                en2.prototype.atX0MinutesPastTheHour = function() {
                  return "at %s minutes past the hour";
                };
                en2.prototype.everyX0Hours = function() {
                  return "every %s hours";
                };
                en2.prototype.betweenX0AndX1 = function() {
                  return "between %s and %s";
                };
                en2.prototype.atX0 = function() {
                  return "at %s";
                };
                en2.prototype.commaEveryDay = function() {
                  return ", every day";
                };
                en2.prototype.commaEveryX0DaysOfTheWeek = function() {
                  return ", every %s days of the week";
                };
                en2.prototype.commaX0ThroughX1 = function() {
                  return ", %s through %s";
                };
                en2.prototype.commaAndX0ThroughX1 = function() {
                  return ", %s through %s";
                };
                en2.prototype.first = function() {
                  return "first";
                };
                en2.prototype.second = function() {
                  return "second";
                };
                en2.prototype.third = function() {
                  return "third";
                };
                en2.prototype.fourth = function() {
                  return "fourth";
                };
                en2.prototype.fifth = function() {
                  return "fifth";
                };
                en2.prototype.commaOnThe = function() {
                  return ", on the ";
                };
                en2.prototype.spaceX0OfTheMonth = function() {
                  return " %s of the month";
                };
                en2.prototype.lastDay = function() {
                  return "the last day";
                };
                en2.prototype.commaOnTheLastX0OfTheMonth = function() {
                  return ", on the last %s of the month";
                };
                en2.prototype.commaOnlyOnX0 = function() {
                  return ", only on %s";
                };
                en2.prototype.commaAndOnX0 = function() {
                  return ", and on %s";
                };
                en2.prototype.commaEveryX0Months = function() {
                  return ", every %s months";
                };
                en2.prototype.commaOnlyInX0 = function() {
                  return ", only in %s";
                };
                en2.prototype.commaOnTheLastDayOfTheMonth = function() {
                  return ", on the last day of the month";
                };
                en2.prototype.commaOnTheLastWeekdayOfTheMonth = function() {
                  return ", on the last weekday of the month";
                };
                en2.prototype.commaDaysBeforeTheLastDayOfTheMonth = function() {
                  return ", %s days before the last day of the month";
                };
                en2.prototype.firstWeekday = function() {
                  return "first weekday";
                };
                en2.prototype.weekdayNearestDayX0 = function() {
                  return "weekday nearest day %s";
                };
                en2.prototype.commaOnTheX0OfTheMonth = function() {
                  return ", on the %s of the month";
                };
                en2.prototype.commaEveryX0Days = function() {
                  return ", every %s days in a month";
                };
                en2.prototype.commaBetweenDayX0AndX1OfTheMonth = function() {
                  return ", between day %s and %s of the month";
                };
                en2.prototype.commaOnDayX0OfTheMonth = function() {
                  return ", on day %s of the month";
                };
                en2.prototype.commaEveryHour = function() {
                  return ", every hour";
                };
                en2.prototype.commaEveryX0Years = function() {
                  return ", every %s years";
                };
                en2.prototype.commaStartingX0 = function() {
                  return ", starting %s";
                };
                en2.prototype.daysOfTheWeek = function() {
                  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                };
                en2.prototype.monthsOfTheYear = function() {
                  return [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
                  ];
                };
                en2.prototype.atReboot = function() {
                  return "Run once, at startup";
                };
                en2.prototype.onTheHour = function() {
                  return "on the hour";
                };
                return en2;
              })();
              exports2.en = en;
            },
            /***/
            515(__unused_webpack_module, exports2) {
              Object.defineProperty(exports2, "__esModule", { value: true });
              function assert(value, message) {
                if (!value) {
                  throw new Error(message);
                }
              }
              var RangeValidator = (function() {
                function RangeValidator2() {
                }
                RangeValidator2.secondRange = function(parse) {
                  var parsed = parse.split(",");
                  for (var i = 0; i < parsed.length; i++) {
                    if (!isNaN(parseInt(parsed[i], 10))) {
                      var second = parseInt(parsed[i], 10);
                      assert(second >= 0 && second <= 59, "seconds part must be >= 0 and <= 59");
                    }
                  }
                };
                RangeValidator2.minuteRange = function(parse) {
                  var parsed = parse.split(",");
                  for (var i = 0; i < parsed.length; i++) {
                    if (!isNaN(parseInt(parsed[i], 10))) {
                      var minute = parseInt(parsed[i], 10);
                      assert(minute >= 0 && minute <= 59, "minutes part must be >= 0 and <= 59");
                    }
                  }
                };
                RangeValidator2.hourRange = function(parse) {
                  var parsed = parse.split(",");
                  for (var i = 0; i < parsed.length; i++) {
                    if (!isNaN(parseInt(parsed[i], 10))) {
                      var hour = parseInt(parsed[i], 10);
                      assert(hour >= 0 && hour <= 23, "hours part must be >= 0 and <= 23");
                    }
                  }
                };
                RangeValidator2.dayOfMonthRange = function(parse) {
                  var parsed = parse.split(",");
                  for (var i = 0; i < parsed.length; i++) {
                    if (!isNaN(parseInt(parsed[i], 10))) {
                      var dayOfMonth = parseInt(parsed[i], 10);
                      assert(dayOfMonth >= 1 && dayOfMonth <= 31, "DOM part must be >= 1 and <= 31");
                    }
                  }
                };
                RangeValidator2.monthRange = function(parse, monthStartIndexZero) {
                  var parsed = parse.split(",");
                  for (var i = 0; i < parsed.length; i++) {
                    if (!isNaN(parseInt(parsed[i], 10))) {
                      var month = parseInt(parsed[i], 10);
                      assert(month >= 1 && month <= 12, monthStartIndexZero ? "month part must be >= 0 and <= 11" : "month part must be >= 1 and <= 12");
                    }
                  }
                };
                RangeValidator2.dayOfWeekRange = function(parse, dayOfWeekStartIndexZero) {
                  var parsed = parse.split(",");
                  for (var i = 0; i < parsed.length; i++) {
                    if (!isNaN(parseInt(parsed[i], 10))) {
                      var dayOfWeek = parseInt(parsed[i], 10);
                      assert(dayOfWeek >= 0 && dayOfWeek <= 6, dayOfWeekStartIndexZero ? "DOW part must be >= 0 and <= 6" : "DOW part must be >= 1 and <= 7");
                    }
                  }
                };
                return RangeValidator2;
              })();
              exports2["default"] = RangeValidator;
            },
            /***/
            823(__unused_webpack_module, exports2) {
              Object.defineProperty(exports2, "__esModule", { value: true });
              exports2.StringUtilities = void 0;
              var StringUtilities = (function() {
                function StringUtilities2() {
                }
                StringUtilities2.format = function(template) {
                  var values = [];
                  for (var _i = 1; _i < arguments.length; _i++) {
                    values[_i - 1] = arguments[_i];
                  }
                  return template.replace(/%s/g, function(substring) {
                    var args = [];
                    for (var _i2 = 1; _i2 < arguments.length; _i2++) {
                      args[_i2 - 1] = arguments[_i2];
                    }
                    return values.shift();
                  });
                };
                StringUtilities2.containsAny = function(text, searchStrings) {
                  return searchStrings.some(function(c) {
                    return text.indexOf(c) > -1;
                  });
                };
                return StringUtilities2;
              })();
              exports2.StringUtilities = StringUtilities;
            }
            /******/
          };
          var __webpack_module_cache__ = {};
          function __webpack_require__(moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== void 0) {
              return cachedModule.exports;
            }
            var module2 = __webpack_module_cache__[moduleId] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          var __webpack_exports__ = {};
          (() => {
            var exports2 = __webpack_exports__;
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.toString = void 0;
            var expressionDescriptor_1 = __webpack_require__(333);
            var enLocaleLoader_1 = __webpack_require__(747);
            expressionDescriptor_1.ExpressionDescriptor.initialize(new enLocaleLoader_1.enLocaleLoader());
            exports2["default"] = expressionDescriptor_1.ExpressionDescriptor;
            var cronstrue_toString = expressionDescriptor_1.ExpressionDescriptor.toString;
            exports2.toString = cronstrue_toString;
          })();
          return __webpack_exports__;
        })()
      );
    });
  }
});

// src/js/utils.js
var escHtml2 = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var copyToClipboard2 = async (text, $btnElement) => {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = $btnElement.text();
    $btnElement.text("Copied!");
    setTimeout(() => {
      $btnElement.text(originalText);
    }, 1500);
  } catch (err) {
    console.error("Failed to copy", err);
  }
};

// src/js/core/navigation.js
window.$navLinks = $(".nav-link");
window.$toolSections = $(".tool-section");
window.$pill = $("<div>").addClass("nav-active-pill").appendTo("#nav-list");
window.movePillTo = ($li) => {
  window.$pill.css({
    top: $li[0].offsetTop + "px",
    height: $li[0].offsetHeight + "px",
    opacity: 1
  });
};
window.updateActiveNav = (targetId) => {
  let $activeLink = null;
  window.$navLinks.each(function() {
    const $link = $(this);
    if ($link.data("target") === targetId) {
      $link.removeClass("text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent");
      $link.addClass("text-blue-400 active-tool");
      $activeLink = $link;
    } else {
      $link.removeClass("text-blue-400 active-tool bg-blue-600/10 border-blue-500/20 shadow-sm");
      $link.addClass("text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent");
    }
  });
  if ($activeLink) {
    window.movePillTo($activeLink.closest("li"));
  }
  window.$toolSections.each(function() {
    const $section = $(this);
    if ($section.attr("id") === targetId) {
      $section.removeClass("entering hidden");
      void $section[0].offsetWidth;
      $section.addClass("entering");
    } else {
      $section.removeClass("entering").addClass("hidden");
    }
  });
};
window.$navLinks.on("click", function(e) {
  e.preventDefault();
  const $this = $(this);
  $this.addClass("icon-clicked");
  setTimeout(() => $this.removeClass("icon-clicked"), 300);
  window.updateActiveNav($this.data("target"));
});
window.updateActiveNav("base64-tool");

// src/js/core/shortcuts.js
window.navTargets = window.$navLinks.map(function() {
  return $(this).data("target");
}).get();
$(document).on("keydown", function(e) {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9 && num <= window.navTargets.length) {
      e.preventDefault();
      window.updateActiveNav(window.navTargets[num - 1]);
    }
  }
});

// src/js/core/favorites.js
window.toolOrder = [...window.navTargets];
window.$navLinks.each(function() {
  const target = $(this).data("target");
  $(this).find("div").first().removeClass("space-x-3").addClass("gap-3 w-full");
  $("<button>").addClass("fav-btn ml-auto flex-shrink-0").attr({ "data-tool": target, title: "Pin to top" }).html("\u2606").appendTo($(this).find("div").first()).on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("bt-favorites") || "[]");
    const idx = favs.indexOf(target);
    idx >= 0 ? favs.splice(idx, 1) : favs.push(target);
    localStorage.setItem("bt-favorites", JSON.stringify(favs));
    applyFavoritesOrder();
  });
});
var applyFavoritesOrder = () => {
  const favs = JSON.parse(localStorage.getItem("bt-favorites") || "[]");
  const $ul = $("#nav-list");
  const $pillEl = $("#nav-list .nav-active-pill").detach();
  $(".fav-divider").remove();
  window.toolOrder.forEach((t) => $(`a[data-target="${t}"]`).closest("li").appendTo($ul));
  [...favs].reverse().forEach((t) => $(`a[data-target="${t}"]`).closest("li").prependTo($ul));
  if (favs.length) {
    const $lastFav = $(`a[data-target="${favs[favs.length - 1]}"]`).closest("li");
    $('<li class="fav-divider px-3 py-1"><div class="h-px bg-gray-700/40 rounded"></div></li>').insertAfter($lastFav);
  }
  $(".fav-btn").each(function() {
    const isFav = favs.includes($(this).data("tool"));
    $(this).html(isFav ? "\u2605" : "\u2606").toggleClass("is-fav", isFav);
    $(this).closest(".nav-link").toggleClass("has-fav", isFav);
  });
  $ul.append($pillEl);
  const $active = $(".nav-link.active-tool");
  if ($active.length) window.movePillTo($active.closest("li"));
};
applyFavoritesOrder();

// src/js/core/theme.js
var applyTheme = (theme) => {
  const t = theme || "ocean";
  document.body.setAttribute("data-theme", t);
  localStorage.setItem("bt-theme", t);
  $(".theme-dot").removeClass("active-theme");
  $(`.theme-dot[data-theme="${t}"]`).addClass("active-theme");
};
$(".theme-dot").on("click", function() {
  applyTheme($(this).data("theme"));
});
applyTheme(localStorage.getItem("bt-theme") || "ocean");

// src/js/tools/base64.js
var $b64Plain = $("#base64-plain");
var $b64Encoded = $("#base64-encoded");
$b64Plain.on("input", function() {
  try {
    $b64Encoded.val(btoa($b64Plain.val()));
  } catch (e) {
    if (e.name === "InvalidCharacterError") {
      $b64Encoded.val(btoa(unescape(encodeURIComponent($b64Plain.val()))));
    } else {
      $b64Encoded.val("");
    }
  }
});
$b64Encoded.on("input", function() {
  try {
    $b64Plain.val(decodeURIComponent(escape(atob($b64Encoded.val()))));
  } catch (e) {
  }
});
var copyToClipboard3 = async (text, $btnElement) => {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = $btnElement.text();
    $btnElement.text("Copied!");
    setTimeout(() => {
      $btnElement.text(originalText);
    }, 1500);
  } catch (err) {
    console.error("Failed to copy", err);
  }
};
$("#b64-copy-plain").on("click", function() {
  copyToClipboard3($b64Plain.val(), $(this));
});
$("#b64-copy-encoded").on("click", function() {
  copyToClipboard3($b64Encoded.val(), $(this));
});

// src/js/tools/hash.js
var $hashInput = $("#hash-input");
var $hashMd5 = $("#hash-md5");
var $hashSha1 = $("#hash-sha1");
var $hashSha256 = $("#hash-sha256");
var $hashSha512 = $("#hash-sha512");
var $hashTabs = $(".hash-tab-btn");
var $hashViews = $(".hash-view");
var $hashFileInput = $("#hash-file-input");
var $hashFileName = $("#hash-file-name");
var $hashLiveIndicator = $("#hash-file-live-indicator");
var currentHashMode = "text";
var clearHashes = () => {
  $hashMd5.val("d41d8cd98f00b204e9800998ecf8427e");
  $hashSha1.val("da39a3ee5e6b4b0d3255bfef95601890afd80709");
  $hashSha256.val("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  $hashSha512.val("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");
};
var setHashes = (hashes) => {
  $hashMd5.val(hashes.md5);
  $hashSha1.val(hashes.sha1);
  $hashSha256.val(hashes.sha256);
  $hashSha512.val(hashes.sha512);
};
$hashTabs.on("click", function() {
  $hashTabs.removeClass("active text-blue-400 border-blue-500").addClass("text-gray-500 border-transparent hover:text-gray-300");
  $(this).addClass("active text-blue-400 border-blue-500").removeClass("text-gray-500 border-transparent hover:text-gray-300");
  $hashViews.addClass("hidden");
  const targetId = $(this).data("view");
  $("#" + targetId).removeClass("hidden");
  currentHashMode = targetId === "hash-text-view" ? "text" : "file";
  if (currentHashMode === "text") {
    window.api.stopFileWatch();
    $hashLiveIndicator.addClass("hidden");
    updateHashes();
  } else {
    if ($hashFileInput[0].files.length === 0) {
      clearHashes();
    } else {
      triggerFileHash(window.api.getPathForFile($hashFileInput[0].files[0]));
    }
  }
});
var updateHashes = async () => {
  if (currentHashMode !== "text") return;
  const text = $hashInput.val();
  if (text === "") {
    clearHashes();
    return;
  }
  try {
    const hashes = await window.api.generateHashes(text);
    setHashes(hashes);
  } catch (e) {
    console.error(e);
  }
};
var triggerFileHash = async (filePath) => {
  try {
    $hashLiveIndicator.removeClass("hidden text-green-400").addClass("text-blue-400");
    $hashLiveIndicator.html(`
           <svg class="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <span class="uppercase tracking-widest text-[10px]">Calculating Secure Hashes...</span>
       `);
    const hashes = await window.api.hashFile(filePath);
    setHashes(hashes);
    $hashLiveIndicator.removeClass("text-blue-400").addClass("text-green-400");
    $hashLiveIndicator.html(`
               <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span class="uppercase tracking-widest text-[10px]">Calculation Complete! Live watch active</span>
       `);
  } catch (e) {
    console.error("File hash error", e);
    clearHashes();
    $hashLiveIndicator.addClass("hidden");
  }
};
$hashFileInput.on("change", function(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    $hashFileName.text(file.name);
    triggerFileHash(window.api.getPathForFile(file));
  } else {
    $hashFileName.text("");
    clearHashes();
    window.api.stopFileWatch();
    $hashLiveIndicator.addClass("hidden");
  }
});
window.api.onFileHashUpdate((newHashes) => {
  if (currentHashMode === "file") {
    setHashes(newHashes);
    $hashLiveIndicator.removeClass("text-blue-400 hidden").addClass("text-green-400");
    $hashLiveIndicator.html(`
               <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span class="uppercase tracking-widest text-[10px]">File Modified! Updated Hashes Live</span>
         `);
  }
});
$hashInput.on("input", updateHashes);
$(".copy-hash-btn").on("click", function() {
  const targetId = $(this).data("target");
  const $inputEl = $("#" + targetId);
  $inputEl.select();
  const hasSvgContext = $(this).find("svg").length > 0;
  copyToClipboard($inputEl.val(), hasSvgContext ? $(this) : $(this));
});

// src/js/tools/epoch.js
var $epochInput = $("#epoch-input");
var $epochCurrentBtn = $("#epoch-current-btn");
var $epochLocalOut = $("#epoch-local-out");
var $epochGmtOut = $("#epoch-gmt-out");
var $epochIsoOut = $("#epoch-iso-out");
var $epochRelativeOut = $("#epoch-relative-out");
var $dateInput = $("#date-input");
var $dateTimestampOut = $("#date-timestamp-out");
var $dateMsOut = $("#date-ms-out");
var $liveTicker = $("#live-epoch");
var $tzSelector = $("#tz-selector");
var $tzOutput = $("#tz-output");
var getRelativeTime = (timestamp2) => {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = timestamp2 - Date.now();
  const absDiff = Math.abs(diff);
  if (absDiff < 1e3) return "just now";
  if (absDiff < 6e4) return rtf.format(Math.round(diff / 1e3), "second");
  if (absDiff < 36e5) return rtf.format(Math.round(diff / 6e4), "minute");
  if (absDiff < 864e5) return rtf.format(Math.round(diff / 36e5), "hour");
  if (absDiff < 2592e6) return rtf.format(Math.round(diff / 864e5), "day");
  return rtf.format(Math.round(diff / 2592e6), "month");
};
var updateEpochUI = (val) => {
  if (!val) {
    $("#epoch-local-out, #epoch-gmt-out, #epoch-iso-out, #epoch-relative-out, #tz-output").text("");
    return;
  }
  let timestamp2 = parseInt(val, 10);
  const isMs = timestamp2 > 1e11;
  const dateMs = isMs ? timestamp2 : timestamp2 * 1e3;
  const d = new Date(dateMs);
  if (isNaN(d.getTime())) {
    $("#epoch-local-out, #epoch-gmt-out, #epoch-iso-out, #epoch-relative-out, #tz-output").text("Invalid Date");
  } else {
    $epochLocalOut.text(d.toLocaleString());
    $epochGmtOut.text(d.toUTCString());
    $epochIsoOut.text(d.toISOString());
    $epochRelativeOut.text(getRelativeTime(dateMs));
    const tz = $tzSelector.val();
    if (tz) {
      $tzOutput.text(d.toLocaleString("en-US", {
        timeZone: tz,
        dateStyle: "full",
        timeStyle: "medium"
      }));
    }
  }
};
$epochInput.on("input", function() {
  updateEpochUI($epochInput.val());
});
$tzSelector.on("change", function() {
  updateEpochUI($epochInput.val());
});
$epochCurrentBtn.on("click", function() {
  const nowS = Math.floor(Date.now() / 1e3);
  $epochInput.val(nowS);
  updateEpochUI(nowS);
});
var updateDateUI = (val) => {
  if (!val) {
    $dateTimestampOut.text("");
    $dateMsOut.text("");
    return;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    $dateTimestampOut.text("Invalid Date");
    $dateMsOut.text("Invalid Date");
  } else {
    const ms = d.getTime();
    $dateTimestampOut.text(Math.floor(ms / 1e3));
    $dateMsOut.text(ms);
  }
};
$dateInput.on("input", function() {
  updateDateUI($dateInput.val());
});
$(".copy-field").on("click", function() {
  const targetId = $(this).data("from");
  const text = $(`#${targetId}`).text();
  if (text && text !== "Invalid Date") {
    window.copyToClipboard(text, $(this));
  }
});
setInterval(() => {
  $liveTicker.text(Math.floor(Date.now() / 1e3));
  const currentVal = $epochInput.val();
  const nowS = Math.floor(Date.now() / 1e3);
  if (Math.abs(parseInt(currentVal) - nowS) <= 1) {
    updateEpochUI(currentVal);
  }
}, 1e3);
var timeZones = Intl.supportedValuesOf("timeZone");
var localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
$tzSelector.html(timeZones.map(
  (tz) => `<option value="${tz}" ${tz === localTz ? "selected" : ""}>${tz.replace(/_/g, " ")}</option>`
).join(""));
$epochCurrentBtn.trigger("click");
var now = /* @__PURE__ */ new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
$dateInput.val(now.toISOString().slice(0, 19));
updateDateUI($dateInput.val());

// src/js/tools/json.js
var $jsonInput = $("#json-input");
var $jsonStatus = $("#json-status");
var $jsonTextOut = $("#json-output-text");
var $jsonTreeOut = $("#json-output-tree");
var $jsonTabs = $(".json-tab-btn");
var $jsonPanes = $(".json-view-pane");
var $jsonSearch = $("#json-search");
var $jsonCopyBtn = $("#json-copy-btn");
var $jsonClearBtn = $("#json-clear-btn");
var currentFormattedJson = "";
$jsonClearBtn.on("click", function() {
  $jsonInput.val("").trigger("input");
  $jsonSearch.val("");
});
$jsonCopyBtn.on("click", function() {
  if (currentFormattedJson) {
    navigator.clipboard.writeText(currentFormattedJson);
    const originalText = $(this).text();
    $(this).text("Copied!").removeClass("text-blue-400 border-blue-500/40").addClass("text-green-400 border-green-500/50 hover:bg-green-500/20");
    setTimeout(() => {
      $(this).text(originalText).removeClass("text-green-400 border-green-500/50 hover:bg-green-500/20").addClass("text-blue-400 border-blue-500/40");
    }, 2e3);
  }
});
$jsonSearch.on("input", function() {
  const q = $(this).val();
  if (q) {
    $("#json-tree-view details").prop("open", true);
  }
});
$jsonSearch.on("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const q = $(this).val();
    if (q) {
      window.find(q, false, false, true, false, true, false);
    }
  }
});
$jsonTabs.on("click", function() {
  $jsonTabs.removeClass("active border-blue-500 text-blue-400").addClass("border-transparent text-gray-500");
  $(this).addClass("active border-blue-500 text-blue-400").removeClass("border-transparent text-gray-500");
  $jsonPanes.addClass("hidden");
  $("#" + $(this).data("view")).removeClass("hidden");
});
var syntaxHighlight = (json2) => {
  json2 = json2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return json2.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
    let cls = "text-orange-400";
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = "text-blue-400 font-semibold";
      } else {
        cls = "text-green-400";
      }
    } else if (/true|false/.test(match)) {
      cls = "text-purple-400 font-bold";
    } else if (/null/.test(match)) {
      cls = "text-gray-500 italic";
    }
    return '<span class="' + cls + '">' + match + "</span>";
  });
};
var createTreeNode2 = (key, value, isLast) => {
  const type2 = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  let badgeColor = "bg-gray-700 text-gray-300";
  if (type2 === "object") badgeColor = "bg-blue-900/50 text-blue-300 border border-blue-700/50";
  else if (type2 === "array") badgeColor = "bg-indigo-900/50 text-indigo-300 border border-indigo-700/50";
  else if (type2 === "string") badgeColor = "bg-green-900/50 text-green-300 border border-green-700/50";
  else if (type2 === "number") badgeColor = "bg-orange-900/50 text-orange-300 border border-orange-700/50";
  else if (type2 === "boolean") badgeColor = "bg-purple-900/50 text-purple-300 border border-purple-700/50";
  else if (type2 === "null") badgeColor = "bg-gray-800 text-gray-500 border border-gray-700/50";
  let typeBadge = `<span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded mr-2 ${badgeColor} shadow-sm align-middle tracking-wider">${type2 === "array" ? "Array[" + value.length + "]" : type2}</span>`;
  let html = `<div class="ml-4 border-l border-gray-700/50 pl-2 py-0.5 opacity-95 hover:opacity-100 transition-opacity">`;
  let keyHtml = key !== null ? `<span class="text-blue-400 font-semibold">"${key}"</span><span class="text-gray-400 mr-2">:</span>${typeBadge}` : `${typeBadge}`;
  if (type2 === "object" || type2 === "array") {
    const isArr = type2 === "array";
    const open = isArr ? "[" : "{";
    const close = isArr ? "]" : "}";
    const keys = Object.keys(value);
    if (keys.length === 0) {
      html += `${keyHtml}<span class="text-gray-400">${open}${close}</span>${!isLast ? '<span class="text-gray-500">,</span>' : ""}`;
    } else {
      html += `<details open class="group">
                  <summary class="cursor-pointer hover:text-white select-none list-none relative flex items-center -ml-3 pl-3">
                    <span class="absolute left-0 text-gray-500 group-open:rotate-90 transition-transform text-[10px]">\u25B6</span>
                    ${keyHtml}<span class="text-gray-400">${open}</span>
                  </summary>
                  <div>`;
      keys.forEach((k, i) => {
        html += createTreeNode2(isArr ? null : k, value[k], i === keys.length - 1);
      });
      html += ` </div>
                  <span class="text-gray-400">${close}</span>${!isLast ? '<span class="text-gray-500">,</span>' : ""}
                </details>`;
    }
  } else {
    let valHtml = "";
    if (type2 === "string") {
      const escapedStr = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      valHtml = `<span class="text-green-400">"${escapedStr}"</span>`;
    } else if (type2 === "number") {
      valHtml = `<span class="text-orange-400">${value}</span>`;
    } else if (type2 === "boolean") {
      valHtml = `<span class="text-purple-400 font-bold">${value}</span>`;
    } else if (type2 === "null") {
      valHtml = `<span class="text-gray-500 italic">null</span>`;
    }
    html += `${keyHtml}${valHtml}${!isLast ? '<span class="text-gray-500">,</span>' : ""}`;
  }
  html += `</div>`;
  return html;
};
var updateJSONUI = () => {
  const raw = $jsonInput.val().trim();
  if (!raw) {
    $jsonStatus.text("Ready").removeClass("bg-red-500/20 text-red-400 bg-green-500/20 text-green-400").addClass("bg-gray-800 text-gray-500");
    $jsonTextOut.html("");
    $jsonTreeOut.html("");
    currentFormattedJson = "";
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    const formatted = JSON.stringify(parsed, null, 2);
    currentFormattedJson = formatted;
    $jsonStatus.text("Valid JSON").removeClass("bg-gray-800 text-gray-500 bg-red-500/20 text-red-400").addClass("bg-green-500/20 text-green-400");
    $jsonTextOut.html(syntaxHighlight(formatted));
    $jsonTreeOut.html(createTreeNode2(null, parsed, true));
  } catch (e) {
    $jsonStatus.text("Invalid JSON").removeClass("bg-gray-800 text-gray-500 bg-green-500/20 text-green-400").addClass("bg-red-500/20 text-red-400");
  }
};
$jsonInput.on("input", updateJSONUI);

// src/js/tools/jwt.js
var $jwtInput = $("#jwt-input");
var $jwtStatus = $("#jwt-status");
var $jwtOutHeader = $("#jwt-output-header");
var $jwtOutPayload = $("#jwt-output-payload");
var $jwtOutSignature = $("#jwt-output-signature");
var $jwtSearch = $("#jwt-search");
var $jwtClearBtn = $("#jwt-clear-btn");
$jwtClearBtn.on("click", function() {
  $jwtInput.val("").trigger("input");
  $jwtSearch.val("");
});
$jwtSearch.on("input", function() {
  const q = $(this).val();
  if (q) {
    $("#jwt-tree-view details").prop("open", true);
  }
});
$jwtSearch.on("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const q = $(this).val();
    if (q) {
      window.find(q, false, false, true, false, true, false);
    }
  }
});
var decodeJWT = (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT Format: Must have 3 parts.");
  const b64DecodeUnicode = (str2) => {
    const base64 = str2.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
    return decodeURIComponent(
      atob(padded).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
  };
  return {
    header: JSON.parse(b64DecodeUnicode(parts[0])),
    payload: JSON.parse(b64DecodeUnicode(parts[1])),
    signature: parts[2]
  };
};
var updateJWTUI = () => {
  const raw = $jwtInput.val().trim();
  if (!raw) {
    $jwtStatus.text("Ready").removeClass("bg-red-500/20 text-red-400 bg-green-500/20 text-green-400").addClass("bg-gray-800 text-gray-500");
    $jwtOutHeader.html("");
    $jwtOutPayload.html("");
    $jwtOutSignature.text("");
    return;
  }
  try {
    const decoded = decodeJWT(raw);
    $jwtStatus.text("Valid Token").removeClass("bg-gray-800 text-gray-500 bg-red-500/20 text-red-400").addClass("bg-green-500/20 text-green-400");
    $jwtOutHeader.html(createTreeNode(null, decoded.header, true));
    $jwtOutPayload.html(createTreeNode(null, decoded.payload, true));
    $jwtOutSignature.text(decoded.signature);
  } catch (e) {
    $jwtStatus.text("Invalid Token").removeClass("bg-gray-800 text-gray-500 bg-green-500/20 text-green-400").addClass("bg-red-500/20 text-red-400");
    $jwtOutHeader.html("");
    $jwtOutPayload.html("");
    $jwtOutSignature.text("");
  }
};
$jwtInput.on("input", updateJWTUI);

// src/js/tools/color.js
var $colorInput = $("#color-input");
var $colorError = $("#color-error");
var $colorSwatch = $("#color-swatch");
var $colorOutHex = $("#color-out-hex");
var $colorOutRgb = $("#color-out-rgb");
var $colorOutHsl = $("#color-out-hsl");
var $colorOutCmyk = $("#color-out-cmyk");
var hexToRgb = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return [Number(r), Number(g), Number(b)];
};
var rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};
var rgbToCmyk = (r, g, b) => {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, Math.min(m, y));
  if (k === 1) {
    return [0, 0, 0, 100];
  }
  c = Math.round((c - k) / (1 - k) * 100);
  m = Math.round((m - k) / (1 - k) * 100);
  y = Math.round((y - k) / (1 - k) * 100);
  k = Math.round(k * 100);
  return [c, m, y, k];
};
var clearColorUI = () => {
  $colorSwatch.css("background-color", "");
  $colorOutHex.text("");
  $colorOutRgb.text("");
  $colorOutHsl.text("");
  $colorOutCmyk.text("");
};
$colorInput.on("input", function() {
  let val = $(this).val().trim();
  if (!val) {
    $colorError.addClass("hidden");
    clearColorUI();
    return;
  }
  if (!val.startsWith("#")) {
    val = "#" + val;
  }
  const validHex = /^#([0-9A-F]{3}){1,2}$/i.test(val);
  if (!validHex) {
    $colorError.removeClass("hidden");
    clearColorUI();
  } else {
    $colorError.addClass("hidden");
    const [r, g, b] = hexToRgb(val);
    const [h, s, l] = rgbToHsl(r, g, b);
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    let fullHex = val.toUpperCase();
    if (fullHex.length === 4) {
      fullHex = "#" + fullHex[1] + fullHex[1] + fullHex[2] + fullHex[2] + fullHex[3] + fullHex[3];
    }
    $colorSwatch.css("background-color", fullHex);
    $colorOutHex.text(fullHex);
    $colorOutRgb.text(`rgb(${r}, ${g}, ${b})`);
    $colorOutHsl.text(`hsl(${h}, ${s}%, ${l}%)`);
    $colorOutCmyk.text(`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`);
  }
});

// src/js/tools/uuid.js
var $uuidQty = $("#uuid-qty");
var $uuidUpper = $("#uuid-upper");
var $uuidHyphens = $("#uuid-hyphens");
var $uuidGenerateBtn = $("#uuid-generate-btn");
var $uuidOutput = $("#uuid-output");
var $uuidCopyBtn = $("#uuid-copy-btn");
$uuidGenerateBtn.on("click", () => {
  let qty = parseInt($uuidQty.val(), 10);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > 1e3) qty = 1e3;
  const isUpper = $uuidUpper.is(":checked");
  const removeHyphens = $uuidHyphens.is(":checked");
  let results = [];
  for (let i = 0; i < qty; i++) {
    let id2 = window.crypto.randomUUID();
    if (removeHyphens) id2 = id2.replaceAll("-", "");
    if (isUpper) id2 = id2.toUpperCase();
    results.push(id2);
  }
  $uuidOutput.val(results.join("\n"));
});
$uuidCopyBtn.on("click", () => {
  const txt = $uuidOutput.val();
  if (txt) {
    navigator.clipboard.writeText(txt);
    const origBtnText = $uuidCopyBtn.html();
    $uuidCopyBtn.html('<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!');
    setTimeout(() => {
      $uuidCopyBtn.html(origBtnText);
    }, 2e3);
  }
});

// src/js/tools/qr.js
var $qrInput = $("#qr-input");
var $qrClearBtn = $("#qr-clear-btn");
var $qrImageContainer = $("#qr-image-container");
var $qrPlaceholder = $("#qr-placeholder");
var $qrImage = $("#qr-image");
var $qrDownloadBtn = $("#qr-download-btn");
$qrClearBtn.on("click", () => {
  $qrInput.val("").trigger("input");
});
$qrInput.on("input", async function() {
  const val = $(this).val().trim();
  if (!val) {
    $qrPlaceholder.removeClass("hidden");
    $qrImage.addClass("hidden").attr("src", "");
    $qrDownloadBtn.addClass("hidden");
    $qrImageContainer.addClass("opacity-20");
    return;
  }
  try {
    const dataUrl = await window.api.generateQR(val);
    $qrPlaceholder.addClass("hidden");
    $qrImage.attr("src", dataUrl).removeClass("hidden");
    $qrDownloadBtn.removeClass("hidden");
    $qrImageContainer.removeClass("opacity-20");
  } catch (err) {
    console.error("QR Generation error via bridging:", err);
  }
});
$qrDownloadBtn.on("click", () => {
  const dataURL = $qrImage.attr("src");
  if (!dataURL) return;
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "qrcode.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// src/js/tools/regex.js
var runRegex = () => {
  const pattern = $("#regex-pattern").val();
  const testStr = $("#regex-input").val();
  const $hl = $("#regex-highlight");
  const $count = $("#regex-match-count");
  const $status = $("#regex-status");
  const $list = $("#regex-match-list");
  if (!pattern) {
    $hl.text(testStr);
    $count.text("");
    $status.html("");
    $list.html("");
    return;
  }
  let flags = "";
  if ($("#rflag-g").is(":checked")) flags += "g";
  if ($("#rflag-i").is(":checked")) flags += "i";
  if ($("#rflag-m").is(":checked")) flags += "m";
  if ($("#rflag-s").is(":checked")) flags += "s";
  let baseRegex;
  try {
    baseRegex = new RegExp(pattern, flags);
    $status.html('<span class="text-green-400 font-mono">\u2713 valid</span>');
  } catch (e) {
    $status.html(`<span class="text-red-400">${escHtml(e.message)}</span>`);
    $hl.text(testStr || "");
    $count.text("");
    $list.html("");
    return;
  }
  const globalRegex = new RegExp(baseRegex.source, flags.includes("g") ? flags : flags + "g");
  globalRegex.lastIndex = 0;
  const matches = [];
  let m;
  while ((m = globalRegex.exec(testStr)) !== null) {
    matches.push({ index: m.index, value: m[0], groups: Array.from(m).slice(1) });
    if (m[0].length === 0) globalRegex.lastIndex++;
  }
  let html = "", last2 = 0;
  matches.forEach((match, i) => {
    html += escHtml(testStr.slice(last2, match.index));
    html += `<mark style="background:rgba(139,92,246,0.30);color:#c4b5fd;border-radius:2px;padding:0 1px" title="Match ${i + 1}">${escHtml(match.value)}</mark>`;
    last2 = match.index + match.value.length;
  });
  html += escHtml(testStr.slice(last2));
  $hl.html(html || '<span class="text-gray-600 italic text-xs">Start typing a pattern...</span>');
  const n = matches.length;
  $count.text(n ? `${n} match${n !== 1 ? "es" : ""}` : "no matches");
  if (n === 0) {
    $list.html('<div class="text-xs text-gray-600 italic px-2 py-1">No matches found.</div>');
  } else {
    $list.html(matches.map((match, i) => {
      const groups = match.groups.filter((g) => g !== void 0).map((g, gi) => `<span class="text-blue-400 ml-2">$${gi + 1}:<span class="text-gray-300">${escHtml(String(g))}</span></span>`).join("");
      return `<div class="flex items-center gap-2 px-2 py-1 bg-gray-800/50 rounded-lg text-xs font-mono">
          <span class="text-violet-500 font-bold w-5 text-right flex-shrink-0">${i + 1}</span>
          <span class="text-gray-600">@${match.index}</span>
          <span class="text-violet-300 truncate max-w-xs">${escHtml(match.value || "(empty)")}</span>
          ${groups}
        </div>`;
    }).join(""));
  }
};
$("#regex-pattern, #regex-input").on("input", runRegex);
$("#rflag-g, #rflag-i, #rflag-m, #rflag-s").on("change", runRegex);

// src/js/tools/diff.js
var computeLineDiff = (oldText, newText) => {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i2 = 1; i2 <= m; i2++)
    for (let j2 = 1; j2 <= n; j2++)
      dp[i2][j2] = a[i2 - 1] === b[j2 - 1] ? dp[i2 - 1][j2 - 1] + 1 : Math.max(dp[i2 - 1][j2], dp[i2][j2 - 1]);
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: "equal", value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", value: b[j - 1] });
      j--;
    } else {
      result.unshift({ type: "removed", value: a[i - 1] });
      i--;
    }
  }
  return result;
};
var createUnifiedPatch = (diffArray, oldLines, newLines) => {
  let patch = `--- original
+++ modified
`;
  patch += `@@ -1,${oldLines.length} +1,${newLines.length} @@
`;
  diffArray.forEach((part) => {
    if (part.type === "added") patch += `+${part.value}
`;
    else if (part.type === "removed") patch += `-${part.value}
`;
    else patch += ` ${part.value}
`;
  });
  return patch;
};
var runDiff = () => {
  const orig = $("#diff-original").val();
  const mod = $("#diff-modified").val();
  const $copyBtn = $("#diff-copy-patch");
  if (!orig && !mod) {
    $("#diff-output").html('<div class="p-4 text-gray-600 italic">Paste text in both fields above to see the diff...</div>');
    $("#diff-stats").html("");
    $copyBtn.addClass("hidden");
    return;
  }
  const diff = computeLineDiff(orig, mod);
  let added = 0, removed = 0, html = "";
  diff.forEach((part) => {
    const v = escHtml(part.value);
    if (part.type === "added") {
      added++;
      html += `<div class="flex items-stretch bg-green-500/10 border-l-2 border-green-500 hover:bg-green-500/15">
          <span class="text-green-500 px-3 py-0.5 select-none font-bold flex-shrink-0">+</span>
          <span class="flex-1 py-0.5 text-green-300 pr-3">${v}</span>
        </div>`;
    } else if (part.type === "removed") {
      removed++;
      html += `<div class="flex items-stretch bg-red-500/10 border-l-2 border-red-600 hover:bg-red-500/15">
          <span class="text-red-500 px-3 py-0.5 select-none font-bold flex-shrink-0">-</span>
          <span class="flex-1 py-0.5 text-red-400 line-through opacity-75 pr-3">${v}</span>
        </div>`;
    } else {
      html += `<div class="flex items-stretch border-l-2 border-transparent hover:bg-gray-800/20">
          <span class="text-gray-700 px-3 py-0.5 select-none flex-shrink-0"> </span>
          <span class="flex-1 py-0.5 text-gray-500 pr-3">${v}</span>
        </div>`;
    }
  });
  $("#diff-output").html(html || '<div class="p-4 text-gray-500">No differences \u2014 both texts are identical.</div>');
  const hasChanges = added > 0 || removed > 0;
  if (hasChanges) {
    $copyBtn.removeClass("hidden");
  } else {
    $copyBtn.addClass("hidden");
  }
  const stats = [
    added ? `<span class="text-green-400">+${added} added</span>` : "",
    removed ? `<span class="text-red-400">-${removed} removed</span>` : "",
    !added && !removed ? '<span class="text-gray-500">Identical</span>' : ""
  ].filter(Boolean).join("");
  $("#diff-stats").html(stats);
};
$("#diff-original, #diff-modified").on("input", runDiff);
$("#diff-copy-patch").on("click", function() {
  const orig = $("#diff-original").val();
  const mod = $("#diff-modified").val();
  const diff = computeLineDiff(orig, mod);
  const patch = createUnifiedPatch(diff, orig.split("\n"), mod.split("\n"));
  window.copyToClipboard(patch, $(this));
});

// src/js/tools/base.js
var VALID_CHARS = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9A-Fa-f]+$/ };
var runBaseConvert = () => {
  const raw = $("#base-input").val().trim().replace(/\s/g, "");
  const fromBase = parseInt($("#base-select").val());
  const $error = $("#base-error");
  const $bitViz = $("#base-bit-viz");
  const clearOutputs = () => {
    ["bin", "oct", "dec", "hex"].forEach((k) => $(`#base-out-${k}`).text("\u2014"));
    $bitViz.addClass("hidden");
  };
  if (!raw) {
    clearOutputs();
    $error.addClass("hidden");
    return;
  }
  if (!VALID_CHARS[fromBase].test(raw)) {
    $error.removeClass("hidden").text(`Invalid character for base ${fromBase}. Allowed: ${Object.keys(VALID_CHARS[fromBase].source.slice(2, -2).split(""))[0]}`);
    clearOutputs();
    return;
  }
  $error.addClass("hidden");
  try {
    const num = parseInt(raw, fromBase);
    if (!isFinite(num) || isNaN(num)) throw new Error("Out of range");
    const bin = num.toString(2);
    const oct = num.toString(8);
    const dec = num.toString(10);
    const hex = num.toString(16).toUpperCase();
    $("#base-out-bin").text(bin.match(/.{1,4}/g).join(" ") || bin);
    $("#base-out-oct").text(oct);
    $("#base-out-dec").text(dec);
    $("#base-out-hex").text("0x" + hex);
    const bitWidth = num <= 255 ? 8 : num <= 65535 ? 16 : num <= 4294967295 ? 32 : 64;
    const padded = bin.padStart(bitWidth, "0");
    const grouped = padded.match(/.{1,8}/g) || [padded];
    $("#base-bits").html(
      grouped.map(
        (byte, bi) => (bi > 0 ? '<span class="mx-2 text-gray-700 select-none">|</span>' : "") + byte.split("").map(
          (c) => c === "1" ? `<span class="text-amber-400 font-bold">${c}</span>` : `<span class="text-gray-600">${c}</span>`
        ).join("")
      ).join("") + `<span class="ml-4 text-xs text-gray-600 font-sans">${bitWidth}-bit</span>`
    );
    $bitViz.removeClass("hidden");
  } catch (e) {
    $error.removeClass("hidden").text("Conversion error: " + e.message);
    clearOutputs();
  }
};
$("#base-input").on("input", runBaseConvert);
$("#base-select").on("change", () => {
  $("#base-input").val("");
  runBaseConvert();
});
$(document).on("click", ".base-copy-btn", function() {
  const id2 = $(this).data("target");
  const txt = $(`#${id2}`).text().replace(/\s/g, "");
  if (!txt || txt === "\u2014") return;
  navigator.clipboard.writeText(txt);
  const $btn = $(this), orig = $btn.text();
  $btn.text("Copied!");
  setTimeout(() => $btn.text(orig), 1500);
});

// src/js/tools/lorem.js
var LOREM = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];
var rWord = () => LOREM[Math.floor(Math.random() * LOREM.length)];
var cap = (s) => s[0].toUpperCase() + s.slice(1);
var genSentence = () => {
  const n = Math.floor(Math.random() * 10) + 6;
  const words = Array.from({ length: n }, rWord);
  if (n > 8 && Math.random() > 0.5) words[Math.floor(n * 0.4)] += ",";
  return cap(words.join(" ")) + ".";
};
var genParagraph = () => Array.from({ length: Math.floor(Math.random() * 3) + 4 }, genSentence).join(" ");
var generateLorem = () => {
  const count = parseInt($("#lorem-count").val());
  const type2 = $("#lorem-type").val();
  let html = "";
  if (type2 === "paragraphs") {
    html = Array.from({ length: count }, (_, i) => {
      const p = i === 0 ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " + Array.from({ length: 3 }, genSentence).join(" ") : genParagraph();
      return `<p>${p}</p>`;
    }).join("");
  } else if (type2 === "sentences") {
    html = `<p>${Array.from({ length: count }, genSentence).join(" ")}</p>`;
  } else {
    const words = Array.from({ length: count * 15 }, rWord);
    html = `<p>${cap(words.join(" "))}.</p>`;
  }
  $("#lorem-output").html(html);
};
$("#lorem-count").on("input", function() {
  $("#lorem-count-val").text($(this).val());
  generateLorem();
});
$("#lorem-type").on("change", generateLorem);
$("#lorem-gen-btn").on("click", generateLorem);
$("#lorem-copy-btn").on("click", function() {
  navigator.clipboard.writeText($("#lorem-output").text());
  $(this).text("Copied!");
  setTimeout(() => $(this).text("Copy"), 1500);
});
generateLorem();

// src/js/tools/string.js
var inspectString = () => {
  const text = $("#inspect-input").val();
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const bytes = new TextEncoder().encode(text).length;
  $("#inspect-chars").text(text.length.toLocaleString());
  $("#inspect-no-spaces").text(text.replace(/\s/g, "").length.toLocaleString());
  $("#inspect-words").text(words.length.toLocaleString());
  $("#inspect-lines").text(text.split("\n").length.toLocaleString());
  $("#inspect-sentences").text(text.split(/[.!?]+\s+/).filter(Boolean).length.toLocaleString());
  $("#inspect-bytes").text(bytes.toLocaleString());
  $("#inspect-unique").text(new Set(text).size.toLocaleString());
  $("#inspect-avg-word").text(words.length ? (words.join("").length / words.length).toFixed(1) : "0");
  if (text) {
    const freq = {};
    for (const c of text) if (c.trim()) freq[c] = (freq[c] || 0) + 1;
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      const [ch, cnt] = top;
      const safeChar = ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch;
      $("#inspect-freq").removeClass("hidden").html(
        `Most frequent: <strong class="text-blue-300 font-mono">${safeChar}</strong> &mdash; appears <strong class="text-blue-300">${cnt}</strong> time${cnt !== 1 ? "s" : ""}`
      );
    }
  } else {
    $("#inspect-freq").addClass("hidden");
  }
};
$("#inspect-input").on("input", inspectString);

// src/js/tools/password.js
var generatePassword = () => {
  const length = parseInt($("#password-length").val());
  let charset = "";
  if ($("#pw-upper").is(":checked")) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if ($("#pw-lower").is(":checked")) charset += "abcdefghijklmnopqrstuvwxyz";
  if ($("#pw-numbers").is(":checked")) charset += "0123456789";
  if ($("#pw-symbols").is(":checked")) charset += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  if ($("#pw-no-ambiguous").is(":checked")) charset = charset.replace(/[0Ol1IB8]/g, "");
  if (!charset) {
    $("#password-output").text("Select at least one character set");
    return;
  }
  const arr = new Uint32Array(length);
  window.crypto.getRandomValues(arr);
  const pwd = Array.from(arr, (n) => charset[n % charset.length]).join("");
  $("#password-output").text(pwd);
  const entropy = length * Math.log2(charset.length);
  const [label, color, width] = entropy < 40 ? ["Weak", "#ef4444", "18%"] : entropy < 60 ? ["Fair", "#f97316", "45%"] : entropy < 80 ? ["Strong", "#22c55e", "72%"] : ["Very Strong", "#10b981", "100%"];
  $("#password-strength-label").text(label).css("color", color);
  $("#password-strength-bar").css({ width, "background-color": color });
};
$("#password-length").on("input", function() {
  $("#password-len-val").text($(this).val());
  generatePassword();
});
$("#pw-upper, #pw-lower, #pw-numbers, #pw-symbols, #pw-no-ambiguous").on("change", generatePassword);
$("#password-gen").on("click", generatePassword);
$("#password-copy").on("click", function() {
  const pwd = $("#password-output").text();
  if (!pwd || pwd === "\u2014") return;
  navigator.clipboard.writeText(pwd);
  $(this).text("Copied!");
  setTimeout(() => $(this).text("Copy"), 1500);
});
generatePassword();

// src/js/tools/markdown.js
var mdDebounce = null;
$("#markdown-input").on("input", function() {
  clearTimeout(mdDebounce);
  mdDebounce = setTimeout(async () => {
    const md = $(this).val();
    if (!md.trim()) {
      $("#markdown-preview").html("");
      return;
    }
    try {
      const html = await window.api.renderMarkdown(md);
      $("#markdown-preview").html(html);
    } catch (e) {
      console.error("Markdown render error:", e);
    }
  }, 120);
});

// src/js/tools/unit.js
var DATA_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];
var DATA_FACTORS = [1, 1024, 1024 ** 2, 1024 ** 3, 1024 ** 4, 1024 ** 5];
var TIME_UNITS = ["ms", "s", "min", "hr", "day", "week"];
var TIME_FACTORS = [1, 1e3, 6e4, 36e5, 864e5, 6048e5];
var LENGTH_UNITS = ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"];
var LENGTH_FACTORS = [1, 10, 1e3, 1e6, 25.4, 304.8, 914.4, 1609344];
var MASS_UNITS = ["mg", "g", "kg", "oz", "lb", "st"];
var MASS_FACTORS = [1e-3, 1, 1e3, 28.3495, 453.592, 6350.29];
var SPEED_UNITS = ["m/s", "km/h", "mph", "kn"];
var SPEED_FACTORS = [1, 0.277778, 0.44704, 0.514444];
var fmtNum = (n) => {
  if (!isFinite(n) || isNaN(n)) return "\u2014";
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-5 && n !== 0) return n.toExponential(3);
  return parseFloat(n.toPrecision(9)).toLocaleString("en-US", { maximumFractionDigits: 6 });
};
var renderUnitCards = (containerId, rawVal, fromUnit, units, factors, accentClass) => {
  const fromIdx = units.indexOf(fromUnit);
  if (fromIdx < 0 || isNaN(rawVal)) {
    $(`#${containerId}`).html("");
    return;
  }
  const base = rawVal * factors[fromIdx];
  $(`#${containerId}`).html(units.map((u, i) => {
    const val = base / factors[i];
    const isActive = u === fromUnit;
    const activeClasses = isActive ? `border-${accentClass}-500/40 bg-${accentClass}-500/10` : "border-gray-700/50 hover:border-gray-500/30";
    return `<div class="bg-gray-800/40 border rounded-xl px-4 py-3 transition-all ${activeClasses}">
        <div class="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 ${isActive ? `text-${accentClass}-400` : ""}">${u}</div>
        <div class="font-mono text-sm text-gray-200 break-all">${fmtNum(val)}</div>
      </div>`;
  }).join(""));
};
var updateData = () => {
  renderUnitCards("unit-data-output", parseFloat($("#unit-data-input").val()), $("#unit-data-from").val(), DATA_UNITS, DATA_FACTORS, "blue");
};
var updateTime = () => {
  renderUnitCards("unit-time-output", parseFloat($("#unit-time-input").val()), $("#unit-time-from").val(), TIME_UNITS, TIME_FACTORS, "purple");
};
var updateLength = () => {
  renderUnitCards("unit-length-output", parseFloat($("#unit-length-input").val()), $("#unit-length-from").val(), LENGTH_UNITS, LENGTH_FACTORS, "emerald");
};
var updateMass = () => {
  renderUnitCards("unit-mass-output", parseFloat($("#unit-mass-input").val()), $("#unit-mass-from").val(), MASS_UNITS, MASS_FACTORS, "amber");
};
var updateSpeed = () => {
  renderUnitCards("unit-speed-output", parseFloat($("#unit-speed-input").val()), $("#unit-speed-from").val(), SPEED_UNITS, SPEED_FACTORS, "rose");
};
$("#unit-data-input, #unit-data-from").on("input change", updateData);
$("#unit-time-input, #unit-time-from").on("input change", updateTime);
$("#unit-length-input, #unit-length-from").on("input change", updateLength);
$("#unit-mass-input, #unit-mass-from").on("input change", updateMass);
$("#unit-speed-input, #unit-speed-from").on("input change", updateSpeed);
updateData();
updateTime();
updateLength();
updateMass();
updateSpeed();

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string2, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string2;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string2, max) {
  return common.repeat(" ", max - string2.length) + string2;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string2, handle, length;
  string2 = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string2.length) + string2;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string2, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string2.length;
  while (position < length) {
    next = string2.indexOf("\n", position);
    if (next === -1) {
      line = string2.slice(position);
      position = length;
    } else {
      line = string2.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string2, pos) {
  var first = string2.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string2.length) {
    second = string2.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string2) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string2);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string2, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string2, 0)) && isPlainSafeLast(codePointAt(string2, string2.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string2.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string2, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string2.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string2, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string2[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string2[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string2)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string2)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string2, level, iskey, inblock) {
  state.dump = (function() {
    if (string2.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string2) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string2)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string2 + '"' : "'" + string2 + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string3) {
      return testImplicitResolving(state, string3);
    }
    switch (chooseScalarStyle(
      string2,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string2;
      case STYLE_SINGLE:
        return "'" + string2.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string2, state.indent) + dropEndingNewline(indentString(string2, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string2, state.indent) + dropEndingNewline(indentString(foldString(string2, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string2) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string2, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string2) ? String(indentPerLevel) : "";
  var clip = string2[string2.length - 1] === "\n";
  var keep = clip && (string2[string2.length - 2] === "\n" || string2 === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string2) {
  return string2[string2.length - 1] === "\n" ? string2.slice(0, -1) : string2;
}
function foldString(string2, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string2.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string2.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string2.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string2[0] === "\n" || string2[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string2)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string2) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string2.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string2, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string2[i];
      if (char >= 65536) result += string2[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};

// src/js/tools/yaml.js
$(document).ready(function() {
  const $input = $("#yaml-input");
  const $output = $("#yaml-output");
  const $error = $("#yaml-error");
  const $outputLabel = $("#yaml-output-label");
  let inputMode = "yaml";
  const updateModeUI = () => {
    const isYaml = inputMode === "yaml";
    $("#yaml-input-type-yaml").toggleClass("bg-blue-600 text-white shadow-sm", isYaml).toggleClass("text-gray-500 hover:text-gray-300", !isYaml);
    $("#yaml-input-type-json").toggleClass("bg-blue-600 text-white shadow-sm", !isYaml).toggleClass("text-gray-500 hover:text-gray-300", isYaml);
    $outputLabel.text(isYaml ? "JSON Output" : "YAML Output");
    $output.toggleClass("text-blue-300", isYaml).toggleClass("text-emerald-300", !isYaml);
    convert();
  };
  const convert = () => {
    const val = $input.val().trim();
    if (!val) {
      $output.val("");
      $error.addClass("hidden");
      return;
    }
    try {
      if (inputMode === "yaml") {
        const obj = jsYaml.load(val);
        $output.val(JSON.stringify(obj, null, 2));
      } else {
        const obj = JSON.parse(val);
        $output.val(jsYaml.dump(obj, { indent: 2 }));
      }
      $error.addClass("hidden");
    } catch (e) {
      $error.removeClass("hidden").text(`Error: ${e.message}`);
      $output.val("");
    }
  };
  $("#yaml-input-type-yaml").on("click", () => {
    inputMode = "yaml";
    updateModeUI();
  });
  $("#yaml-input-type-json").on("click", () => {
    inputMode = "json";
    updateModeUI();
  });
  $input.on("input", convert);
  $("#yaml-clear-btn").on("click", () => {
    $input.val("").focus();
    $output.val("");
    $error.addClass("hidden");
  });
  $("#yaml-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
  updateModeUI();
});

// src/js/tools/url.js
$(document).ready(function() {
  const $input = $("#url-input");
  const $output = $("#url-output");
  const $error = $("#url-error");
  let mode = "encode";
  const updateUI = () => {
    const isEncode = mode === "encode";
    $("#url-mode-encode").toggleClass("bg-blue-600 text-white shadow-sm", isEncode).toggleClass("text-gray-500 hover:text-gray-300", !isEncode);
    $("#url-mode-decode").toggleClass("bg-blue-600 text-white shadow-sm", !isEncode).toggleClass("text-gray-500 hover:text-gray-300", isEncode);
    process();
  };
  const process = () => {
    const val = $input.val();
    if (!val) {
      $output.val("");
      $error.addClass("hidden");
      return;
    }
    try {
      if (mode === "encode") {
        $output.val(encodeURIComponent(val));
      } else {
        $output.val(decodeURIComponent(val));
      }
      $error.addClass("hidden");
    } catch (e) {
      $error.removeClass("hidden").text(`Error: ${e.message}`);
      $output.val("");
    }
  };
  $("#url-mode-encode").on("click", () => {
    mode = "encode";
    updateUI();
  });
  $("#url-mode-decode").on("click", () => {
    mode = "decode";
    updateUI();
  });
  $input.on("input", process);
  $("#url-clear-btn").on("click", () => {
    $input.val("").focus();
    $output.val("");
    $error.addClass("hidden");
  });
  $("#url-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
  updateUI();
});

// src/js/tools/case.js
$(document).ready(function() {
  const $input = $("#case-input");
  const toWords = (str2) => {
    return str2.replace(/([A-Z])/g, " $1").replace(/[_\-]/g, " ").trim().split(/\s+/).filter((w) => w.length > 0);
  };
  const toCamel = (words) => {
    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  };
  const toSnake = (words) => words.map((w) => w.toLowerCase()).join("_");
  const toKebab = (words) => words.map((w) => w.toLowerCase()).join("-");
  const toPascal = (words) => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  const toConstant = (words) => words.map((w) => w.toUpperCase()).join("_");
  const toSentence = (words) => {
    if (words.length === 0) return "";
    const s = words.join(" ").toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const convert = () => {
    const val = $input.val().trim();
    if (!val) {
      $("#out-camel, #out-snake, #out-kebab, #out-pascal, #out-constant, #out-sentence").text("");
      return;
    }
    const words = toWords(val);
    $("#out-camel").text(toCamel(words));
    $("#out-snake").text(toSnake(words));
    $("#out-kebab").text(toKebab(words));
    $("#out-pascal").text(toPascal(words));
    $("#out-constant").text(toConstant(words));
    $("#out-sentence").text(toSentence(words));
  };
  $input.on("input", convert);
  $("#case-clear-btn").on("click", () => {
    $input.val("").focus();
    convert();
  });
  $(".case-copy-btn").on("click", function() {
    const targetId = $(this).data("from");
    const text = $(`#${targetId}`).text();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});

// src/js/tools/entities.js
$(document).ready(function() {
  const $input = $("#entities-input");
  const $output = $("#entities-output");
  let mode = "encode";
  const encodeEntities = (str2) => {
    const div = document.createElement("div");
    div.textContent = str2;
    return div.innerHTML;
  };
  const decodeEntities = (str2) => {
    const div = document.createElement("div");
    div.innerHTML = str2;
    return div.textContent;
  };
  const updateUI = () => {
    const isEncode = mode === "encode";
    $("#entities-mode-encode").toggleClass("bg-blue-600 text-white shadow-sm", isEncode).toggleClass("text-gray-500 hover:text-gray-300", !isEncode);
    $("#entities-mode-decode").toggleClass("bg-blue-600 text-white shadow-sm", !isEncode).toggleClass("text-gray-500 hover:text-gray-300", isEncode);
    process();
  };
  const process = () => {
    const val = $input.val();
    if (!val) {
      $output.val("");
      return;
    }
    if (mode === "encode") {
      $output.val(encodeEntities(val));
    } else {
      $output.val(decodeEntities(val));
    }
  };
  $("#entities-mode-encode").on("click", () => {
    mode = "encode";
    updateUI();
  });
  $("#entities-mode-decode").on("click", () => {
    mode = "decode";
    updateUI();
  });
  $input.on("input", process);
  $("#entities-clear-btn").on("click", () => {
    $input.val("").focus();
    $output.val("");
  });
  $("#entities-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
  updateUI();
});

// src/js/tools/transform.js
$(document).ready(function() {
  const $input = $("#transform-input");
  const $output = $("#transform-output");
  const $lineCount = $("#transform-line-count");
  const $wordCount = $("#transform-word-count");
  const $charCount = $("#transform-char-count");
  const updateStats = (text) => {
    const lines = text ? text.split("\n").length : 0;
    const words = text ? text.trim().split(/\s+/).filter((w) => w).length : 0;
    const chars = text ? text.length : 0;
    $lineCount.text(lines);
    $wordCount.text(words);
    $charCount.text(chars);
  };
  const getLines = () => $input.val().split("\n");
  const setOutput = (lines) => {
    const result = lines.join("\n");
    $output.val(result);
    updateStats(result);
  };
  $("#transform-sort-asc").on("click", () => {
    setOutput(getLines().sort((a, b) => a.localeCompare(b)));
  });
  $("#transform-sort-desc").on("click", () => {
    setOutput(getLines().sort((a, b) => b.localeCompare(a)));
  });
  $("#transform-unique").on("click", () => {
    setOutput([...new Set(getLines())]);
  });
  $("#transform-reverse").on("click", () => {
    setOutput(getLines().reverse());
  });
  $("#transform-trim").on("click", () => {
    setOutput(getLines().map((l) => l.trim()));
  });
  $("#transform-apply-fix").on("click", () => {
    const prefix = $("#transform-prefix").val();
    const suffix = $("#transform-suffix").val();
    setOutput(getLines().map((l) => prefix + l + suffix));
  });
  $input.on("input", () => {
    const val = $input.val();
    $output.val(val);
    updateStats(val);
  });
  $("#transform-clear-btn").on("click", () => {
    $input.val("").focus();
    $output.val("");
    updateStats("");
  });
  $("#transform-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});

// node_modules/sql-formatter/dist/esm/allDialects.js
var allDialects_exports = {};
__export(allDialects_exports, {
  bigquery: () => bigquery,
  clickhouse: () => clickhouse,
  db2: () => db2,
  db2i: () => db2i,
  duckdb: () => duckdb,
  hive: () => hive,
  mariadb: () => mariadb,
  mysql: () => mysql,
  n1ql: () => n1ql,
  plsql: () => plsql,
  postgresql: () => postgresql,
  redshift: () => redshift,
  singlestoredb: () => singlestoredb,
  snowflake: () => snowflake,
  spark: () => spark,
  sql: () => sql,
  sqlite: () => sqlite,
  tidb: () => tidb,
  transactsql: () => transactsql,
  trino: () => trino
});

// node_modules/sql-formatter/dist/esm/expandPhrases.js
var expandPhrases = (phrases) => phrases.flatMap(expandSinglePhrase);
var expandSinglePhrase = (phrase) => buildCombinations(parsePhrase(phrase)).map(stripExtraWhitespace);
var stripExtraWhitespace = (text) => text.replace(/ +/g, " ").trim();
var parsePhrase = (text) => ({
  type: "mandatory_block",
  items: parseAlteration(text, 0)[0]
});
var parseAlteration = (text, index, expectClosing) => {
  const alterations = [];
  while (text[index]) {
    const [term, newIndex] = parseConcatenation(text, index);
    alterations.push(term);
    index = newIndex;
    if (text[index] === "|") {
      index++;
    } else if (text[index] === "}" || text[index] === "]") {
      if (expectClosing !== text[index]) {
        throw new Error(`Unbalanced parenthesis in: ${text}`);
      }
      index++;
      return [alterations, index];
    } else if (index === text.length) {
      if (expectClosing) {
        throw new Error(`Unbalanced parenthesis in: ${text}`);
      }
      return [alterations, index];
    } else {
      throw new Error(`Unexpected "${text[index]}"`);
    }
  }
  return [alterations, index];
};
var parseConcatenation = (text, index) => {
  const items = [];
  while (true) {
    const [term, newIndex] = parseTerm(text, index);
    if (term) {
      items.push(term);
      index = newIndex;
    } else {
      break;
    }
  }
  return items.length === 1 ? [items[0], index] : [{ type: "concatenation", items }, index];
};
var parseTerm = (text, index) => {
  if (text[index] === "{") {
    return parseMandatoryBlock(text, index + 1);
  } else if (text[index] === "[") {
    return parseOptionalBlock(text, index + 1);
  } else {
    let word = "";
    while (text[index] && /[A-Za-z0-9_ ]/.test(text[index])) {
      word += text[index];
      index++;
    }
    return [word, index];
  }
};
var parseMandatoryBlock = (text, index) => {
  const [items, newIndex] = parseAlteration(text, index, "}");
  return [{ type: "mandatory_block", items }, newIndex];
};
var parseOptionalBlock = (text, index) => {
  const [items, newIndex] = parseAlteration(text, index, "]");
  return [{ type: "optional_block", items }, newIndex];
};
var buildCombinations = (node) => {
  if (typeof node === "string") {
    return [node];
  } else if (node.type === "concatenation") {
    return node.items.map(buildCombinations).reduce(stringCombinations, [""]);
  } else if (node.type === "mandatory_block") {
    return node.items.flatMap(buildCombinations);
  } else if (node.type === "optional_block") {
    return ["", ...node.items.flatMap(buildCombinations)];
  } else {
    throw new Error(`Unknown node type: ${node}`);
  }
};
var stringCombinations = (xs, ys) => {
  const results = [];
  for (const x of xs) {
    for (const y of ys) {
      results.push(x + y);
    }
  }
  return results;
};

// node_modules/sql-formatter/dist/esm/lexer/token.js
var TokenType;
(function(TokenType2) {
  TokenType2["QUOTED_IDENTIFIER"] = "QUOTED_IDENTIFIER";
  TokenType2["IDENTIFIER"] = "IDENTIFIER";
  TokenType2["STRING"] = "STRING";
  TokenType2["VARIABLE"] = "VARIABLE";
  TokenType2["RESERVED_DATA_TYPE"] = "RESERVED_DATA_TYPE";
  TokenType2["RESERVED_PARAMETERIZED_DATA_TYPE"] = "RESERVED_PARAMETERIZED_DATA_TYPE";
  TokenType2["RESERVED_KEYWORD"] = "RESERVED_KEYWORD";
  TokenType2["RESERVED_FUNCTION_NAME"] = "RESERVED_FUNCTION_NAME";
  TokenType2["RESERVED_KEYWORD_PHRASE"] = "RESERVED_KEYWORD_PHRASE";
  TokenType2["RESERVED_DATA_TYPE_PHRASE"] = "RESERVED_DATA_TYPE_PHRASE";
  TokenType2["RESERVED_SET_OPERATION"] = "RESERVED_SET_OPERATION";
  TokenType2["RESERVED_CLAUSE"] = "RESERVED_CLAUSE";
  TokenType2["RESERVED_SELECT"] = "RESERVED_SELECT";
  TokenType2["RESERVED_JOIN"] = "RESERVED_JOIN";
  TokenType2["ARRAY_IDENTIFIER"] = "ARRAY_IDENTIFIER";
  TokenType2["ARRAY_KEYWORD"] = "ARRAY_KEYWORD";
  TokenType2["CASE"] = "CASE";
  TokenType2["END"] = "END";
  TokenType2["WHEN"] = "WHEN";
  TokenType2["ELSE"] = "ELSE";
  TokenType2["THEN"] = "THEN";
  TokenType2["LIMIT"] = "LIMIT";
  TokenType2["BETWEEN"] = "BETWEEN";
  TokenType2["AND"] = "AND";
  TokenType2["OR"] = "OR";
  TokenType2["XOR"] = "XOR";
  TokenType2["OPERATOR"] = "OPERATOR";
  TokenType2["COMMA"] = "COMMA";
  TokenType2["ASTERISK"] = "ASTERISK";
  TokenType2["PROPERTY_ACCESS_OPERATOR"] = "PROPERTY_ACCESS_OPERATOR";
  TokenType2["OPEN_PAREN"] = "OPEN_PAREN";
  TokenType2["CLOSE_PAREN"] = "CLOSE_PAREN";
  TokenType2["LINE_COMMENT"] = "LINE_COMMENT";
  TokenType2["BLOCK_COMMENT"] = "BLOCK_COMMENT";
  TokenType2["DISABLE_COMMENT"] = "DISABLE_COMMENT";
  TokenType2["NUMBER"] = "NUMBER";
  TokenType2["NAMED_PARAMETER"] = "NAMED_PARAMETER";
  TokenType2["QUOTED_PARAMETER"] = "QUOTED_PARAMETER";
  TokenType2["NUMBERED_PARAMETER"] = "NUMBERED_PARAMETER";
  TokenType2["POSITIONAL_PARAMETER"] = "POSITIONAL_PARAMETER";
  TokenType2["CUSTOM_PARAMETER"] = "CUSTOM_PARAMETER";
  TokenType2["DELIMITER"] = "DELIMITER";
  TokenType2["EOF"] = "EOF";
})(TokenType = TokenType || (TokenType = {}));
var createEofToken = (index) => ({
  type: TokenType.EOF,
  raw: "\xABEOF\xBB",
  text: "\xABEOF\xBB",
  start: index
});
var EOF_TOKEN = createEofToken(Infinity);
var testToken = (compareToken) => (token) => token.type === compareToken.type && token.text === compareToken.text;
var isToken = {
  ARRAY: testToken({ text: "ARRAY", type: TokenType.RESERVED_DATA_TYPE }),
  BY: testToken({ text: "BY", type: TokenType.RESERVED_KEYWORD }),
  SET: testToken({ text: "SET", type: TokenType.RESERVED_CLAUSE }),
  STRUCT: testToken({ text: "STRUCT", type: TokenType.RESERVED_DATA_TYPE }),
  WINDOW: testToken({ text: "WINDOW", type: TokenType.RESERVED_CLAUSE }),
  VALUES: testToken({ text: "VALUES", type: TokenType.RESERVED_CLAUSE })
};
var isReserved = (type2) => type2 === TokenType.RESERVED_DATA_TYPE || type2 === TokenType.RESERVED_KEYWORD || type2 === TokenType.RESERVED_FUNCTION_NAME || type2 === TokenType.RESERVED_KEYWORD_PHRASE || type2 === TokenType.RESERVED_DATA_TYPE_PHRASE || type2 === TokenType.RESERVED_CLAUSE || type2 === TokenType.RESERVED_SELECT || type2 === TokenType.RESERVED_SET_OPERATION || type2 === TokenType.RESERVED_JOIN || type2 === TokenType.ARRAY_KEYWORD || type2 === TokenType.CASE || type2 === TokenType.END || type2 === TokenType.WHEN || type2 === TokenType.ELSE || type2 === TokenType.THEN || type2 === TokenType.LIMIT || type2 === TokenType.BETWEEN || type2 === TokenType.AND || type2 === TokenType.OR || type2 === TokenType.XOR;
var isLogicalOperator = (type2) => type2 === TokenType.AND || type2 === TokenType.OR || type2 === TokenType.XOR;

// node_modules/sql-formatter/dist/esm/languages/bigquery/bigquery.functions.js
var functions = [
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/aead_encryption_functions
  "KEYS.NEW_KEYSET",
  "KEYS.ADD_KEY_FROM_RAW_BYTES",
  "AEAD.DECRYPT_BYTES",
  "AEAD.DECRYPT_STRING",
  "AEAD.ENCRYPT",
  "KEYS.KEYSET_CHAIN",
  "KEYS.KEYSET_FROM_JSON",
  "KEYS.KEYSET_TO_JSON",
  "KEYS.ROTATE_KEYSET",
  "KEYS.KEYSET_LENGTH",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_analytic_functions
  "ANY_VALUE",
  "ARRAY_AGG",
  "AVG",
  "CORR",
  "COUNT",
  "COUNTIF",
  "COVAR_POP",
  "COVAR_SAMP",
  "MAX",
  "MIN",
  "ST_CLUSTERDBSCAN",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STRING_AGG",
  "SUM",
  "VAR_POP",
  "VAR_SAMP",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions
  "ANY_VALUE",
  "ARRAY_AGG",
  "ARRAY_CONCAT_AGG",
  "AVG",
  "BIT_AND",
  "BIT_OR",
  "BIT_XOR",
  "COUNT",
  "COUNTIF",
  "LOGICAL_AND",
  "LOGICAL_OR",
  "MAX",
  "MIN",
  "STRING_AGG",
  "SUM",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions
  "APPROX_COUNT_DISTINCT",
  "APPROX_QUANTILES",
  "APPROX_TOP_COUNT",
  "APPROX_TOP_SUM",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions
  // 'ARRAY',
  "ARRAY_CONCAT",
  "ARRAY_LENGTH",
  "ARRAY_TO_STRING",
  "GENERATE_ARRAY",
  "GENERATE_DATE_ARRAY",
  "GENERATE_TIMESTAMP_ARRAY",
  "ARRAY_REVERSE",
  "OFFSET",
  "SAFE_OFFSET",
  "ORDINAL",
  "SAFE_ORDINAL",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/bit_functions
  "BIT_COUNT",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/conversion_functions
  // 'CASE',
  "PARSE_BIGNUMERIC",
  "PARSE_NUMERIC",
  "SAFE_CAST",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/date_functions
  "CURRENT_DATE",
  "EXTRACT",
  "DATE",
  "DATE_ADD",
  "DATE_SUB",
  "DATE_DIFF",
  "DATE_TRUNC",
  "DATE_FROM_UNIX_DATE",
  "FORMAT_DATE",
  "LAST_DAY",
  "PARSE_DATE",
  "UNIX_DATE",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/datetime_functions
  "CURRENT_DATETIME",
  "DATETIME",
  "EXTRACT",
  "DATETIME_ADD",
  "DATETIME_SUB",
  "DATETIME_DIFF",
  "DATETIME_TRUNC",
  "FORMAT_DATETIME",
  "LAST_DAY",
  "PARSE_DATETIME",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/debugging_functions
  "ERROR",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/federated_query_functions
  "EXTERNAL_QUERY",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/geography_functions
  "S2_CELLIDFROMPOINT",
  "S2_COVERINGCELLIDS",
  "ST_ANGLE",
  "ST_AREA",
  "ST_ASBINARY",
  "ST_ASGEOJSON",
  "ST_ASTEXT",
  "ST_AZIMUTH",
  "ST_BOUNDARY",
  "ST_BOUNDINGBOX",
  "ST_BUFFER",
  "ST_BUFFERWITHTOLERANCE",
  "ST_CENTROID",
  "ST_CENTROID_AGG",
  "ST_CLOSESTPOINT",
  "ST_CLUSTERDBSCAN",
  "ST_CONTAINS",
  "ST_CONVEXHULL",
  "ST_COVEREDBY",
  "ST_COVERS",
  "ST_DIFFERENCE",
  "ST_DIMENSION",
  "ST_DISJOINT",
  "ST_DISTANCE",
  "ST_DUMP",
  "ST_DWITHIN",
  "ST_ENDPOINT",
  "ST_EQUALS",
  "ST_EXTENT",
  "ST_EXTERIORRING",
  "ST_GEOGFROM",
  "ST_GEOGFROMGEOJSON",
  "ST_GEOGFROMTEXT",
  "ST_GEOGFROMWKB",
  "ST_GEOGPOINT",
  "ST_GEOGPOINTFROMGEOHASH",
  "ST_GEOHASH",
  "ST_GEOMETRYTYPE",
  "ST_INTERIORRINGS",
  "ST_INTERSECTION",
  "ST_INTERSECTS",
  "ST_INTERSECTSBOX",
  "ST_ISCOLLECTION",
  "ST_ISEMPTY",
  "ST_LENGTH",
  "ST_MAKELINE",
  "ST_MAKEPOLYGON",
  "ST_MAKEPOLYGONORIENTED",
  "ST_MAXDISTANCE",
  "ST_NPOINTS",
  "ST_NUMGEOMETRIES",
  "ST_NUMPOINTS",
  "ST_PERIMETER",
  "ST_POINTN",
  "ST_SIMPLIFY",
  "ST_SNAPTOGRID",
  "ST_STARTPOINT",
  "ST_TOUCHES",
  "ST_UNION",
  "ST_UNION_AGG",
  "ST_WITHIN",
  "ST_X",
  "ST_Y",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/hash_functions
  "FARM_FINGERPRINT",
  "MD5",
  "SHA1",
  "SHA256",
  "SHA512",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/hll_functions
  "HLL_COUNT.INIT",
  "HLL_COUNT.MERGE",
  "HLL_COUNT.MERGE_PARTIAL",
  "HLL_COUNT.EXTRACT",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/interval_functions
  "MAKE_INTERVAL",
  "EXTRACT",
  "JUSTIFY_DAYS",
  "JUSTIFY_HOURS",
  "JUSTIFY_INTERVAL",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/json_functions
  "JSON_EXTRACT",
  "JSON_QUERY",
  "JSON_EXTRACT_SCALAR",
  "JSON_VALUE",
  "JSON_EXTRACT_ARRAY",
  "JSON_QUERY_ARRAY",
  "JSON_EXTRACT_STRING_ARRAY",
  "JSON_VALUE_ARRAY",
  "TO_JSON_STRING",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/mathematical_functions
  "ABS",
  "SIGN",
  "IS_INF",
  "IS_NAN",
  "IEEE_DIVIDE",
  "RAND",
  "SQRT",
  "POW",
  "POWER",
  "EXP",
  "LN",
  "LOG",
  "LOG10",
  "GREATEST",
  "LEAST",
  "DIV",
  "SAFE_DIVIDE",
  "SAFE_MULTIPLY",
  "SAFE_NEGATE",
  "SAFE_ADD",
  "SAFE_SUBTRACT",
  "MOD",
  "ROUND",
  "TRUNC",
  "CEIL",
  "CEILING",
  "FLOOR",
  "COS",
  "COSH",
  "ACOS",
  "ACOSH",
  "SIN",
  "SINH",
  "ASIN",
  "ASINH",
  "TAN",
  "TANH",
  "ATAN",
  "ATANH",
  "ATAN2",
  "RANGE_BUCKET",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/navigation_functions
  "FIRST_VALUE",
  "LAST_VALUE",
  "NTH_VALUE",
  "LEAD",
  "LAG",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/net_functions
  "NET.IP_FROM_STRING",
  "NET.SAFE_IP_FROM_STRING",
  "NET.IP_TO_STRING",
  "NET.IP_NET_MASK",
  "NET.IP_TRUNC",
  "NET.IPV4_FROM_INT64",
  "NET.IPV4_TO_INT64",
  "NET.HOST",
  "NET.PUBLIC_SUFFIX",
  "NET.REG_DOMAIN",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/numbering_functions
  "RANK",
  "DENSE_RANK",
  "PERCENT_RANK",
  "CUME_DIST",
  "NTILE",
  "ROW_NUMBER",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/security_functions
  "SESSION_USER",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/statistical_aggregate_functions
  "CORR",
  "COVAR_POP",
  "COVAR_SAMP",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STDDEV",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/string_functions
  "ASCII",
  "BYTE_LENGTH",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "CHR",
  "CODE_POINTS_TO_BYTES",
  "CODE_POINTS_TO_STRING",
  "CONCAT",
  "CONTAINS_SUBSTR",
  "ENDS_WITH",
  "FORMAT",
  "FROM_BASE32",
  "FROM_BASE64",
  "FROM_HEX",
  "INITCAP",
  "INSTR",
  "LEFT",
  "LENGTH",
  "LPAD",
  "LOWER",
  "LTRIM",
  "NORMALIZE",
  "NORMALIZE_AND_CASEFOLD",
  "OCTET_LENGTH",
  "REGEXP_CONTAINS",
  "REGEXP_EXTRACT",
  "REGEXP_EXTRACT_ALL",
  "REGEXP_INSTR",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "REPLACE",
  "REPEAT",
  "REVERSE",
  "RIGHT",
  "RPAD",
  "RTRIM",
  "SAFE_CONVERT_BYTES_TO_STRING",
  "SOUNDEX",
  "SPLIT",
  "STARTS_WITH",
  "STRPOS",
  "SUBSTR",
  "SUBSTRING",
  "TO_BASE32",
  "TO_BASE64",
  "TO_CODE_POINTS",
  "TO_HEX",
  "TRANSLATE",
  "TRIM",
  "UNICODE",
  "UPPER",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/time_functions
  "CURRENT_TIME",
  "TIME",
  "EXTRACT",
  "TIME_ADD",
  "TIME_SUB",
  "TIME_DIFF",
  "TIME_TRUNC",
  "FORMAT_TIME",
  "PARSE_TIME",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/timestamp_functions
  "CURRENT_TIMESTAMP",
  "EXTRACT",
  "STRING",
  "TIMESTAMP",
  "TIMESTAMP_ADD",
  "TIMESTAMP_SUB",
  "TIMESTAMP_DIFF",
  "TIMESTAMP_TRUNC",
  "FORMAT_TIMESTAMP",
  "PARSE_TIMESTAMP",
  "TIMESTAMP_SECONDS",
  "TIMESTAMP_MILLIS",
  "TIMESTAMP_MICROS",
  "UNIX_SECONDS",
  "UNIX_MILLIS",
  "UNIX_MICROS",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/uuid_functions
  "GENERATE_UUID",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/conditional_expressions
  "COALESCE",
  "IF",
  "IFNULL",
  "NULLIF",
  // https://cloud.google.com/bigquery/docs/reference/legacy-sql
  // legacyAggregate
  "AVG",
  "BIT_AND",
  "BIT_OR",
  "BIT_XOR",
  "CORR",
  "COUNT",
  "COVAR_POP",
  "COVAR_SAMP",
  "EXACT_COUNT_DISTINCT",
  "FIRST",
  "GROUP_CONCAT",
  "GROUP_CONCAT_UNQUOTED",
  "LAST",
  "MAX",
  "MIN",
  "NEST",
  "NTH",
  "QUANTILES",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "SUM",
  "TOP",
  "UNIQUE",
  "VARIANCE",
  "VAR_POP",
  "VAR_SAMP",
  // legacyBitwise
  "BIT_COUNT",
  // legacyCasting
  "BOOLEAN",
  "BYTES",
  "CAST",
  "FLOAT",
  "HEX_STRING",
  "INTEGER",
  "STRING",
  // legacyComparison
  // expr 'IN',
  "COALESCE",
  "GREATEST",
  "IFNULL",
  "IS_INF",
  "IS_NAN",
  "IS_EXPLICITLY_DEFINED",
  "LEAST",
  "NVL",
  // legacyDatetime
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "DATE",
  "DATE_ADD",
  "DATEDIFF",
  "DAY",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "FORMAT_UTC_USEC",
  "HOUR",
  "MINUTE",
  "MONTH",
  "MSEC_TO_TIMESTAMP",
  "NOW",
  "PARSE_UTC_USEC",
  "QUARTER",
  "SEC_TO_TIMESTAMP",
  "SECOND",
  "STRFTIME_UTC_USEC",
  "TIME",
  "TIMESTAMP",
  "TIMESTAMP_TO_MSEC",
  "TIMESTAMP_TO_SEC",
  "TIMESTAMP_TO_USEC",
  "USEC_TO_TIMESTAMP",
  "UTC_USEC_TO_DAY",
  "UTC_USEC_TO_HOUR",
  "UTC_USEC_TO_MONTH",
  "UTC_USEC_TO_WEEK",
  "UTC_USEC_TO_YEAR",
  "WEEK",
  "YEAR",
  // legacyIp
  "FORMAT_IP",
  "PARSE_IP",
  "FORMAT_PACKED_IP",
  "PARSE_PACKED_IP",
  // legacyJson
  "JSON_EXTRACT",
  "JSON_EXTRACT_SCALAR",
  // legacyMath
  "ABS",
  "ACOS",
  "ACOSH",
  "ASIN",
  "ASINH",
  "ATAN",
  "ATANH",
  "ATAN2",
  "CEIL",
  "COS",
  "COSH",
  "DEGREES",
  "EXP",
  "FLOOR",
  "LN",
  "LOG",
  "LOG2",
  "LOG10",
  "PI",
  "POW",
  "RADIANS",
  "RAND",
  "ROUND",
  "SIN",
  "SINH",
  "SQRT",
  "TAN",
  "TANH",
  // legacyRegex
  "REGEXP_MATCH",
  "REGEXP_EXTRACT",
  "REGEXP_REPLACE",
  // legacyString
  "CONCAT",
  // expr CONTAINS 'str'
  "INSTR",
  "LEFT",
  "LENGTH",
  "LOWER",
  "LPAD",
  "LTRIM",
  "REPLACE",
  "RIGHT",
  "RPAD",
  "RTRIM",
  "SPLIT",
  "SUBSTR",
  "UPPER",
  // legacyTableWildcard
  "TABLE_DATE_RANGE",
  "TABLE_DATE_RANGE_STRICT",
  "TABLE_QUERY",
  // legacyUrl
  "HOST",
  "DOMAIN",
  "TLD",
  // legacyWindow
  "AVG",
  "COUNT",
  "MAX",
  "MIN",
  "STDDEV",
  "SUM",
  "CUME_DIST",
  "DENSE_RANK",
  "FIRST_VALUE",
  "LAG",
  "LAST_VALUE",
  "LEAD",
  "NTH_VALUE",
  "NTILE",
  "PERCENT_RANK",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "RANK",
  "RATIO_TO_REPORT",
  "ROW_NUMBER",
  // legacyMisc
  "CURRENT_USER",
  "EVERY",
  "FROM_BASE64",
  "HASH",
  "FARM_FINGERPRINT",
  "IF",
  "POSITION",
  "SHA1",
  "SOME",
  "TO_BASE64",
  // other
  "BQ.JOBS.CANCEL",
  "BQ.REFRESH_MATERIALIZED_VIEW",
  // ddl
  "OPTIONS",
  // pivot
  "PIVOT",
  "UNPIVOT"
];

// node_modules/sql-formatter/dist/esm/languages/bigquery/bigquery.keywords.js
var keywords = [
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/lexical#reserved_keywords
  "ALL",
  "AND",
  "ANY",
  "AS",
  "ASC",
  "ASSERT_ROWS_MODIFIED",
  "AT",
  "BETWEEN",
  "BY",
  "CASE",
  "CAST",
  "COLLATE",
  "CONTAINS",
  "CREATE",
  "CROSS",
  "CUBE",
  "CURRENT",
  "DEFAULT",
  "DEFINE",
  "DESC",
  "DISTINCT",
  "ELSE",
  "END",
  "ENUM",
  "ESCAPE",
  "EXCEPT",
  "EXCLUDE",
  "EXISTS",
  "EXTRACT",
  "FALSE",
  "FETCH",
  "FOLLOWING",
  "FOR",
  "FROM",
  "FULL",
  "GROUP",
  "GROUPING",
  "GROUPS",
  "HASH",
  "HAVING",
  "IF",
  "IGNORE",
  "IN",
  "INNER",
  "INTERSECT",
  "INTO",
  "IS",
  "JOIN",
  "LATERAL",
  "LEFT",
  "LIMIT",
  "LOOKUP",
  "MERGE",
  "NATURAL",
  "NEW",
  "NO",
  "NOT",
  "NULL",
  "NULLS",
  "OF",
  "ON",
  "OR",
  "ORDER",
  "OUTER",
  "OVER",
  "PARTITION",
  "PRECEDING",
  "PROTO",
  "RANGE",
  "RECURSIVE",
  "RESPECT",
  "RIGHT",
  "ROLLUP",
  "ROWS",
  "SELECT",
  "SET",
  "SOME",
  "TABLE",
  "TABLESAMPLE",
  "THEN",
  "TO",
  "TREAT",
  "TRUE",
  "UNBOUNDED",
  "UNION",
  "UNNEST",
  "USING",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITHIN",
  // misc
  "SAFE",
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
  "LIKE",
  "COPY",
  "CLONE",
  "IN",
  "OUT",
  "INOUT",
  "RETURNS",
  "LANGUAGE",
  "CASCADE",
  "RESTRICT",
  "DETERMINISTIC"
];
var dataTypes = [
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types
  "ARRAY",
  "BOOL",
  "BYTES",
  "DATE",
  "DATETIME",
  "GEOGRAPHY",
  "INTERVAL",
  "INT64",
  "INT",
  "SMALLINT",
  "INTEGER",
  "BIGINT",
  "TINYINT",
  "BYTEINT",
  "NUMERIC",
  "DECIMAL",
  "BIGNUMERIC",
  "BIGDECIMAL",
  "FLOAT64",
  "STRING",
  "STRUCT",
  "TIME",
  "TIMEZONE"
];

// node_modules/sql-formatter/dist/esm/languages/bigquery/bigquery.formatter.js
var reservedSelect = expandPhrases(["SELECT [ALL | DISTINCT] [AS STRUCT | AS VALUE]"]);
var reservedClauses = expandPhrases([
  // Queries: https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "QUALIFY",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "OMIT RECORD IF",
  // Data modification: https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax
  // - insert:
  "INSERT [INTO]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE [INTO]",
  "WHEN [NOT] MATCHED [BY SOURCE | BY TARGET] [THEN]",
  "UPDATE SET",
  "CLUSTER BY",
  "FOR SYSTEM_TIME AS OF",
  "WITH CONNECTION",
  "WITH PARTITION COLUMNS",
  "REMOTE WITH CONNECTION"
]);
var standardOnelineClauses = expandPhrases([
  "CREATE [OR REPLACE] [TEMP|TEMPORARY|SNAPSHOT|EXTERNAL] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses = expandPhrases([
  // - create:
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
  "CREATE [OR REPLACE] [MATERIALIZED] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP [SNAPSHOT | EXTERNAL] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS]",
  "ADD COLUMN [IF NOT EXISTS]",
  "DROP COLUMN [IF EXISTS]",
  "RENAME TO",
  "ALTER COLUMN [IF EXISTS]",
  "SET DEFAULT COLLATE",
  "SET OPTIONS",
  "DROP NOT NULL",
  "SET DATA TYPE",
  // - alter schema
  "ALTER SCHEMA [IF EXISTS]",
  // - alter view
  "ALTER [MATERIALIZED] VIEW [IF EXISTS]",
  // - alter bi_capacity
  "ALTER BI_CAPACITY",
  // - truncate:
  "TRUNCATE TABLE",
  // - create schema
  "CREATE SCHEMA [IF NOT EXISTS]",
  "DEFAULT COLLATE",
  // stored procedures
  "CREATE [OR REPLACE] [TEMP|TEMPORARY|TABLE] FUNCTION [IF NOT EXISTS]",
  "CREATE [OR REPLACE] PROCEDURE [IF NOT EXISTS]",
  // row access policy
  "CREATE [OR REPLACE] ROW ACCESS POLICY [IF NOT EXISTS]",
  "GRANT TO",
  "FILTER USING",
  // capacity
  "CREATE CAPACITY",
  "AS JSON",
  // reservation
  "CREATE RESERVATION",
  // assignment
  "CREATE ASSIGNMENT",
  // search index
  "CREATE SEARCH INDEX [IF NOT EXISTS]",
  // drop
  "DROP SCHEMA [IF EXISTS]",
  "DROP [MATERIALIZED] VIEW [IF EXISTS]",
  "DROP [TABLE] FUNCTION [IF EXISTS]",
  "DROP PROCEDURE [IF EXISTS]",
  "DROP ROW ACCESS POLICY",
  "DROP ALL ROW ACCESS POLICIES",
  "DROP CAPACITY [IF EXISTS]",
  "DROP RESERVATION [IF EXISTS]",
  "DROP ASSIGNMENT [IF EXISTS]",
  "DROP SEARCH INDEX [IF EXISTS]",
  "DROP [IF EXISTS]",
  // DCL, https://cloud.google.com/bigquery/docs/reference/standard-sql/data-control-language
  "GRANT",
  "REVOKE",
  // Script, https://cloud.google.com/bigquery/docs/reference/standard-sql/scripting
  "DECLARE",
  "EXECUTE IMMEDIATE",
  "LOOP",
  "END LOOP",
  "REPEAT",
  "END REPEAT",
  "WHILE",
  "END WHILE",
  "BREAK",
  "LEAVE",
  "CONTINUE",
  "ITERATE",
  "FOR",
  "END FOR",
  "BEGIN",
  "BEGIN TRANSACTION",
  "COMMIT TRANSACTION",
  "ROLLBACK TRANSACTION",
  "RAISE",
  "RETURN",
  "CALL",
  // Debug, https://cloud.google.com/bigquery/docs/reference/standard-sql/debugging-statements
  "ASSERT",
  // Other, https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements
  "EXPORT DATA"
]);
var reservedSetOperations = expandPhrases([
  "UNION {ALL | DISTINCT}",
  "EXCEPT DISTINCT",
  "INTERSECT DISTINCT"
]);
var reservedJoins = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN"
]);
var reservedKeywordPhrases = expandPhrases([
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#tablesample_operator
  "TABLESAMPLE SYSTEM",
  // From DDL: https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
  "ANY TYPE",
  "ALL COLUMNS",
  "NOT DETERMINISTIC",
  // inside window definitions
  "{ROWS | RANGE} BETWEEN",
  // comparison operator
  "IS [NOT] DISTINCT FROM"
]);
var reservedDataTypePhrases = expandPhrases([]);
var bigquery = {
  name: "bigquery",
  tokenizerOptions: {
    reservedSelect,
    reservedClauses: [...reservedClauses, ...tabularOnelineClauses, ...standardOnelineClauses],
    reservedSetOperations,
    reservedJoins,
    reservedKeywordPhrases,
    reservedDataTypePhrases,
    reservedKeywords: keywords,
    reservedDataTypes: dataTypes,
    reservedFunctionNames: functions,
    extraParens: ["[]"],
    stringTypes: [
      // The triple-quoted strings are listed first, so they get matched first.
      // Otherwise the first two quotes of """ will get matched as an empty "" string.
      { quote: '""".."""', prefixes: ["R", "B", "RB", "BR"] },
      { quote: "'''..'''", prefixes: ["R", "B", "RB", "BR"] },
      '""-bs',
      "''-bs",
      { quote: '""-raw', prefixes: ["R", "B", "RB", "BR"], requirePrefix: true },
      { quote: "''-raw", prefixes: ["R", "B", "RB", "BR"], requirePrefix: true }
    ],
    identTypes: ["``"],
    identChars: { dashes: true },
    paramTypes: { positional: true, named: ["@"], quoted: ["@"] },
    variableTypes: [{ regex: String.raw`@@\w+` }],
    lineCommentTypes: ["--", "#"],
    operators: ["&", "|", "^", "~", ">>", "<<", "||", "=>"],
    postProcess
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses, ...tabularOnelineClauses],
    tabularOnelineClauses
  }
};
function postProcess(tokens) {
  return detectArraySubscripts(combineParameterizedTypes(tokens));
}
function detectArraySubscripts(tokens) {
  let prevToken = EOF_TOKEN;
  return tokens.map((token) => {
    if (token.text === "OFFSET" && prevToken.text === "[") {
      prevToken = token;
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_FUNCTION_NAME });
    } else {
      prevToken = token;
      return token;
    }
  });
}
function combineParameterizedTypes(tokens) {
  var _a;
  const processed = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if ((isToken.ARRAY(token) || isToken.STRUCT(token)) && ((_a = tokens[i + 1]) === null || _a === void 0 ? void 0 : _a.text) === "<") {
      const endIndex = findClosingAngleBracketIndex(tokens, i + 1);
      const typeDefTokens = tokens.slice(i, endIndex + 1);
      processed.push({
        type: TokenType.IDENTIFIER,
        raw: typeDefTokens.map(formatTypeDefToken("raw")).join(""),
        text: typeDefTokens.map(formatTypeDefToken("text")).join(""),
        start: token.start
      });
      i = endIndex;
    } else {
      processed.push(token);
    }
  }
  return processed;
}
var formatTypeDefToken = (key) => (token) => {
  if (token.type === TokenType.IDENTIFIER || token.type === TokenType.COMMA) {
    return token[key] + " ";
  } else {
    return token[key];
  }
};
function findClosingAngleBracketIndex(tokens, startIndex) {
  let level = 0;
  for (let i = startIndex; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.text === "<") {
      level++;
    } else if (token.text === ">") {
      level--;
    } else if (token.text === ">>") {
      level -= 2;
    }
    if (level === 0) {
      return i;
    }
  }
  return tokens.length - 1;
}

// node_modules/sql-formatter/dist/esm/languages/clickhouse/clickhouse.functions.js
var functions2 = [
  // Derived from `select name from system.functions order by name;` on Clickhouse Cloud
  // as of November 14, 2025.
  "BIT_AND",
  "BIT_OR",
  "BIT_XOR",
  "BLAKE3",
  "CAST",
  "CHARACTER_LENGTH",
  "CHAR_LENGTH",
  "COVAR_POP",
  "COVAR_SAMP",
  "CRC32",
  "CRC32IEEE",
  "CRC64",
  "DATE",
  "DATE_DIFF",
  "DATE_FORMAT",
  "DATE_TRUNC",
  "DAY",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "FORMAT_BYTES",
  "FQDN",
  "FROM_BASE64",
  "FROM_DAYS",
  "FROM_UNIXTIME",
  "HOUR",
  "INET6_ATON",
  "INET6_NTOA",
  "INET_ATON",
  "INET_NTOA",
  "IPv4CIDRToRange",
  "IPv4NumToString",
  "IPv4NumToStringClassC",
  "IPv4StringToNum",
  "IPv4StringToNumOrDefault",
  "IPv4StringToNumOrNull",
  "IPv4ToIPv6",
  "IPv6CIDRToRange",
  "IPv6NumToString",
  "IPv6StringToNum",
  "IPv6StringToNumOrDefault",
  "IPv6StringToNumOrNull",
  "JSONAllPaths",
  "JSONAllPathsWithTypes",
  "JSONArrayLength",
  "JSONDynamicPaths",
  "JSONDynamicPathsWithTypes",
  "JSONExtract",
  "JSONExtractArrayRaw",
  "JSONExtractArrayRawCaseInsensitive",
  "JSONExtractBool",
  "JSONExtractBoolCaseInsensitive",
  "JSONExtractCaseInsensitive",
  "JSONExtractFloat",
  "JSONExtractFloatCaseInsensitive",
  "JSONExtractInt",
  "JSONExtractIntCaseInsensitive",
  "JSONExtractKeys",
  "JSONExtractKeysAndValues",
  "JSONExtractKeysAndValuesCaseInsensitive",
  "JSONExtractKeysAndValuesRaw",
  "JSONExtractKeysAndValuesRawCaseInsensitive",
  "JSONExtractKeysCaseInsensitive",
  "JSONExtractRaw",
  "JSONExtractRawCaseInsensitive",
  "JSONExtractString",
  "JSONExtractStringCaseInsensitive",
  "JSONExtractUInt",
  "JSONExtractUIntCaseInsensitive",
  "JSONHas",
  "JSONKey",
  "JSONLength",
  "JSONMergePatch",
  "JSONSharedDataPaths",
  "JSONSharedDataPathsWithTypes",
  "JSONType",
  "JSON_ARRAY_LENGTH",
  "JSON_EXISTS",
  "JSON_QUERY",
  "JSON_VALUE",
  "L1Distance",
  "L1Norm",
  "L1Normalize",
  "L2Distance",
  "L2Norm",
  "L2Normalize",
  "L2SquaredDistance",
  "L2SquaredNorm",
  "LAST_DAY",
  "LinfDistance",
  "LinfNorm",
  "LinfNormalize",
  "LpDistance",
  "LpNorm",
  "LpNormalize",
  "MACNumToString",
  "MACStringToNum",
  "MACStringToOUI",
  "MAP_FROM_ARRAYS",
  "MD4",
  "MD5",
  "MILLISECOND",
  "MINUTE",
  "MONTH",
  "OCTET_LENGTH",
  "QUARTER",
  "REGEXP_EXTRACT",
  "REGEXP_MATCHES",
  "REGEXP_REPLACE",
  "RIPEMD160",
  "SCHEMA",
  "SECOND",
  "SHA1",
  "SHA224",
  "SHA256",
  "SHA384",
  "SHA512",
  "SHA512_256",
  "STD",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "ST_LineFromWKB",
  "ST_MLineFromWKB",
  "ST_MPolyFromWKB",
  "ST_PointFromWKB",
  "ST_PolyFromWKB",
  "SUBSTRING_INDEX",
  "SVG",
  "TIMESTAMP_DIFF",
  "TO_BASE64",
  "TO_DAYS",
  "TO_UNIXTIME",
  "ULIDStringToDateTime",
  "URLHash",
  "URLHierarchy",
  "URLPathHierarchy",
  "UTCTimestamp",
  "UTC_timestamp",
  "UUIDNumToString",
  "UUIDStringToNum",
  "UUIDToNum",
  "UUIDv7ToDateTime",
  "VAR_POP",
  "VAR_SAMP",
  "YEAR",
  "YYYYMMDDToDate",
  "YYYYMMDDToDate32",
  "YYYYMMDDhhmmssToDateTime",
  "YYYYMMDDhhmmssToDateTime64",
  "_CAST",
  "__actionName",
  "__bitBoolMaskAnd",
  "__bitBoolMaskOr",
  "__bitSwapLastTwo",
  "__bitWrapperFunc",
  "__getScalar",
  "__patchPartitionID",
  "__scalarSubqueryResult",
  "abs",
  "accurateCast",
  "accurateCastOrDefault",
  "accurateCastOrNull",
  "acos",
  "acosh",
  "addDate",
  "addDays",
  "addHours",
  "addInterval",
  "addMicroseconds",
  "addMilliseconds",
  "addMinutes",
  "addMonths",
  "addNanoseconds",
  "addQuarters",
  "addSeconds",
  "addTupleOfIntervals",
  "addWeeks",
  "addYears",
  "addressToLine",
  "addressToLineWithInlines",
  "addressToSymbol",
  "aes_decrypt_mysql",
  "aes_encrypt_mysql",
  "age",
  "aggThrow",
  "alphaTokens",
  "analysisOfVariance",
  "anova",
  "any",
  "anyHeavy",
  "anyLast",
  "anyLastRespectNulls",
  "anyLast_respect_nulls",
  "anyRespectNulls",
  "anyValueRespectNulls",
  "any_respect_nulls",
  "any_value",
  "any_value_respect_nulls",
  "appendTrailingCharIfAbsent",
  "approx_top_count",
  "approx_top_k",
  "approx_top_sum",
  "argMax",
  "argMin",
  "array",
  "arrayAUC",
  "arrayAUCPR",
  "arrayAll",
  "arrayAvg",
  "arrayCompact",
  "arrayConcat",
  "arrayCount",
  "arrayCumSum",
  "arrayCumSumNonNegative",
  "arrayDifference",
  "arrayDistinct",
  "arrayDotProduct",
  "arrayElement",
  "arrayElementOrNull",
  "arrayEnumerate",
  "arrayEnumerateDense",
  "arrayEnumerateDenseRanked",
  "arrayEnumerateUniq",
  "arrayEnumerateUniqRanked",
  "arrayExists",
  "arrayFill",
  "arrayFilter",
  "arrayFirst",
  "arrayFirstIndex",
  "arrayFirstOrNull",
  "arrayFlatten",
  "arrayFold",
  "arrayIntersect",
  "arrayJaccardIndex",
  "arrayJoin",
  "arrayLast",
  "arrayLastIndex",
  "arrayLastOrNull",
  "arrayLevenshteinDistance",
  "arrayLevenshteinDistanceWeighted",
  "arrayMap",
  "arrayMax",
  "arrayMin",
  "arrayNormalizedGini",
  "arrayPRAUC",
  "arrayPartialReverseSort",
  "arrayPartialShuffle",
  "arrayPartialSort",
  "arrayPopBack",
  "arrayPopFront",
  "arrayProduct",
  "arrayPushBack",
  "arrayPushFront",
  "arrayROCAUC",
  "arrayRandomSample",
  "arrayReduce",
  "arrayReduceInRanges",
  "arrayResize",
  "arrayReverse",
  "arrayReverseFill",
  "arrayReverseSort",
  "arrayReverseSplit",
  "arrayRotateLeft",
  "arrayRotateRight",
  "arrayShiftLeft",
  "arrayShiftRight",
  "arrayShingles",
  "arrayShuffle",
  "arraySimilarity",
  "arraySlice",
  "arraySort",
  "arraySplit",
  "arrayStringConcat",
  "arraySum",
  "arraySymmetricDifference",
  "arrayUnion",
  "arrayUniq",
  "arrayWithConstant",
  "arrayZip",
  "arrayZipUnaligned",
  "array_agg",
  "array_concat_agg",
  "ascii",
  "asin",
  "asinh",
  "assumeNotNull",
  "atan",
  "atan2",
  "atanh",
  "authenticatedUser",
  "avg",
  "avgWeighted",
  "bar",
  "base32Decode",
  "base32Encode",
  "base58Decode",
  "base58Encode",
  "base64Decode",
  "base64Encode",
  "base64URLDecode",
  "base64URLEncode",
  "basename",
  "bech32Decode",
  "bech32Encode",
  "bin",
  "bitAnd",
  "bitCount",
  "bitHammingDistance",
  "bitNot",
  "bitOr",
  "bitPositionsToArray",
  "bitRotateLeft",
  "bitRotateRight",
  "bitShiftLeft",
  "bitShiftRight",
  "bitSlice",
  "bitTest",
  "bitTestAll",
  "bitTestAny",
  "bitXor",
  "bitmapAnd",
  "bitmapAndCardinality",
  "bitmapAndnot",
  "bitmapAndnotCardinality",
  "bitmapBuild",
  "bitmapCardinality",
  "bitmapContains",
  "bitmapHasAll",
  "bitmapHasAny",
  "bitmapMax",
  "bitmapMin",
  "bitmapOr",
  "bitmapOrCardinality",
  "bitmapSubsetInRange",
  "bitmapSubsetLimit",
  "bitmapToArray",
  "bitmapTransform",
  "bitmapXor",
  "bitmapXorCardinality",
  "bitmaskToArray",
  "bitmaskToList",
  "blockNumber",
  "blockSerializedSize",
  "blockSize",
  "boundingRatio",
  "buildId",
  "byteHammingDistance",
  "byteSize",
  "byteSlice",
  "byteSwap",
  "caseWithExpr",
  "caseWithExpression",
  "caseWithoutExpr",
  "caseWithoutExpression",
  "catboostEvaluate",
  "categoricalInformationValue",
  "cbrt",
  "ceil",
  "ceiling",
  "changeDay",
  "changeHour",
  "changeMinute",
  "changeMonth",
  "changeSecond",
  "changeYear",
  "char",
  "cityHash64",
  "clamp",
  "coalesce",
  "colorOKLCHToSRGB",
  "colorSRGBToOKLCH",
  "compareSubstrings",
  "concat",
  "concatAssumeInjective",
  "concatWithSeparator",
  "concatWithSeparatorAssumeInjective",
  "concat_ws",
  "connectionId",
  "connection_id",
  "contingency",
  "convertCharset",
  "corr",
  "corrMatrix",
  "corrStable",
  "cos",
  "cosh",
  "cosineDistance",
  "count",
  "countDigits",
  "countEqual",
  "countMatches",
  "countMatchesCaseInsensitive",
  "countSubstrings",
  "countSubstringsCaseInsensitive",
  "countSubstringsCaseInsensitiveUTF8",
  "covarPop",
  "covarPopMatrix",
  "covarPopStable",
  "covarSamp",
  "covarSampMatrix",
  "covarSampStable",
  "cramersV",
  "cramersVBiasCorrected",
  "curdate",
  "currentDatabase",
  "currentProfiles",
  "currentQueryID",
  "currentRoles",
  "currentSchemas",
  "currentUser",
  "current_database",
  "current_date",
  "current_query_id",
  "current_schemas",
  "current_timestamp",
  "current_user",
  "cutFragment",
  "cutIPv6",
  "cutQueryString",
  "cutQueryStringAndFragment",
  "cutToFirstSignificantSubdomain",
  "cutToFirstSignificantSubdomainCustom",
  "cutToFirstSignificantSubdomainCustomRFC",
  "cutToFirstSignificantSubdomainCustomWithWWW",
  "cutToFirstSignificantSubdomainCustomWithWWWRFC",
  "cutToFirstSignificantSubdomainRFC",
  "cutToFirstSignificantSubdomainWithWWW",
  "cutToFirstSignificantSubdomainWithWWWRFC",
  "cutURLParameter",
  "cutWWW",
  "damerauLevenshteinDistance",
  "dateDiff",
  "dateName",
  "dateTime64ToSnowflake",
  "dateTime64ToSnowflakeID",
  "dateTimeToSnowflake",
  "dateTimeToSnowflakeID",
  "dateTimeToUUIDv7",
  "dateTrunc",
  "date_bin",
  "date_diff",
  "decodeHTMLComponent",
  "decodeURLComponent",
  "decodeURLFormComponent",
  "decodeXMLComponent",
  "decrypt",
  "defaultProfiles",
  "defaultRoles",
  "defaultValueOfArgumentType",
  "defaultValueOfTypeName",
  "degrees",
  "deltaSum",
  "deltaSumTimestamp",
  "demangle",
  "denseRank",
  "dense_rank",
  "detectCharset",
  "detectLanguage",
  "detectLanguageMixed",
  "detectLanguageUnknown",
  "detectProgrammingLanguage",
  "detectTonality",
  "dictGet",
  "dictGetAll",
  "dictGetChildren",
  "dictGetDate",
  "dictGetDateOrDefault",
  "dictGetDateTime",
  "dictGetDateTimeOrDefault",
  "dictGetDescendants",
  "dictGetFloat32",
  "dictGetFloat32OrDefault",
  "dictGetFloat64",
  "dictGetFloat64OrDefault",
  "dictGetHierarchy",
  "dictGetIPv4",
  "dictGetIPv4OrDefault",
  "dictGetIPv6",
  "dictGetIPv6OrDefault",
  "dictGetInt16",
  "dictGetInt16OrDefault",
  "dictGetInt32",
  "dictGetInt32OrDefault",
  "dictGetInt64",
  "dictGetInt64OrDefault",
  "dictGetInt8",
  "dictGetInt8OrDefault",
  "dictGetOrDefault",
  "dictGetOrNull",
  "dictGetString",
  "dictGetStringOrDefault",
  "dictGetUInt16",
  "dictGetUInt16OrDefault",
  "dictGetUInt32",
  "dictGetUInt32OrDefault",
  "dictGetUInt64",
  "dictGetUInt64OrDefault",
  "dictGetUInt8",
  "dictGetUInt8OrDefault",
  "dictGetUUID",
  "dictGetUUIDOrDefault",
  "dictHas",
  "dictIsIn",
  "displayName",
  "distanceL1",
  "distanceL2",
  "distanceL2Squared",
  "distanceLinf",
  "distanceLp",
  "distinctDynamicTypes",
  "distinctJSONPaths",
  "distinctJSONPathsAndTypes",
  "divide",
  "divideDecimal",
  "divideOrNull",
  "domain",
  "domainRFC",
  "domainWithoutWWW",
  "domainWithoutWWWRFC",
  "dotProduct",
  "dumpColumnStructure",
  "dynamicElement",
  "dynamicType",
  "e",
  "editDistance",
  "editDistanceUTF8",
  "empty",
  "emptyArrayDate",
  "emptyArrayDateTime",
  "emptyArrayFloat32",
  "emptyArrayFloat64",
  "emptyArrayInt16",
  "emptyArrayInt32",
  "emptyArrayInt64",
  "emptyArrayInt8",
  "emptyArrayString",
  "emptyArrayToSingle",
  "emptyArrayUInt16",
  "emptyArrayUInt32",
  "emptyArrayUInt64",
  "emptyArrayUInt8",
  "enabledProfiles",
  "enabledRoles",
  "encodeURLComponent",
  "encodeURLFormComponent",
  "encodeXMLComponent",
  "encrypt",
  "endsWith",
  "endsWithUTF8",
  "entropy",
  "equals",
  "erf",
  "erfc",
  "errorCodeToName",
  "estimateCompressionRatio",
  "evalMLMethod",
  "exp",
  "exp10",
  "exp2",
  "exponentialMovingAverage",
  "exponentialTimeDecayedAvg",
  "exponentialTimeDecayedCount",
  "exponentialTimeDecayedMax",
  "exponentialTimeDecayedSum",
  "extract",
  "extractAll",
  "extractAllGroups",
  "extractAllGroupsHorizontal",
  "extractAllGroupsVertical",
  "extractGroups",
  "extractKeyValuePairs",
  "extractKeyValuePairsWithEscaping",
  "extractTextFromHTML",
  "extractURLParameter",
  "extractURLParameterNames",
  "extractURLParameters",
  "factorial",
  "farmFingerprint64",
  "farmHash64",
  "file",
  "filesystemAvailable",
  "filesystemCapacity",
  "filesystemUnreserved",
  "finalizeAggregation",
  "financialInternalRateOfReturn",
  "financialInternalRateOfReturnExtended",
  "financialNetPresentValue",
  "financialNetPresentValueExtended",
  "firstLine",
  "firstSignificantSubdomain",
  "firstSignificantSubdomainCustom",
  "firstSignificantSubdomainCustomRFC",
  "firstSignificantSubdomainRFC",
  "firstValueRespectNulls",
  "first_value",
  "first_value_respect_nulls",
  "flameGraph",
  "flatten",
  "flattenTuple",
  "floor",
  // We do not include FORMAT as a function, because it's also a keyword.
  // FORMAT clauses are fairly common: https://clickhouse.com/docs/sql-reference/statements/select/format
  // 'format',
  "formatDateTime",
  "formatDateTimeInJodaSyntax",
  "formatQuery",
  "formatQueryOrNull",
  "formatQuerySingleLine",
  "formatQuerySingleLineOrNull",
  "formatReadableDecimalSize",
  "formatReadableQuantity",
  "formatReadableSize",
  "formatReadableTimeDelta",
  "formatRow",
  "formatRowNoNewline",
  "fragment",
  "fromDaysSinceYearZero",
  "fromDaysSinceYearZero32",
  "fromModifiedJulianDay",
  "fromModifiedJulianDayOrNull",
  "fromUTCTimestamp",
  "fromUnixTimestamp",
  "fromUnixTimestamp64Micro",
  "fromUnixTimestamp64Milli",
  "fromUnixTimestamp64Nano",
  "fromUnixTimestamp64Second",
  "fromUnixTimestampInJodaSyntax",
  "from_utc_timestamp",
  "fullHostName",
  "fuzzBits",
  "gccMurmurHash",
  "gcd",
  "generateRandomStructure",
  "generateSerialID",
  "generateSnowflakeID",
  "generateULID",
  "generateUUIDv4",
  "generateUUIDv7",
  "geoDistance",
  "geoToH3",
  "geoToS2",
  "geohashDecode",
  "geohashEncode",
  "geohashesInBox",
  "getClientHTTPHeader",
  "getMacro",
  "getMaxTableNameLengthForDatabase",
  "getMergeTreeSetting",
  "getOSKernelVersion",
  "getServerPort",
  "getServerSetting",
  "getSetting",
  "getSettingOrDefault",
  "getSizeOfEnumType",
  "getSubcolumn",
  "getTypeSerializationStreams",
  "globalIn",
  "globalInIgnoreSet",
  "globalNotIn",
  "globalNotInIgnoreSet",
  "globalNotNullIn",
  "globalNotNullInIgnoreSet",
  "globalNullIn",
  "globalNullInIgnoreSet",
  "globalVariable",
  "greatCircleAngle",
  "greatCircleDistance",
  "greater",
  "greaterOrEquals",
  "greatest",
  "groupArray",
  "groupArrayInsertAt",
  "groupArrayIntersect",
  "groupArrayLast",
  "groupArrayMovingAvg",
  "groupArrayMovingSum",
  "groupArraySample",
  "groupArraySorted",
  "groupBitAnd",
  "groupBitOr",
  "groupBitXor",
  "groupBitmap",
  "groupBitmapAnd",
  "groupBitmapOr",
  "groupBitmapXor",
  "groupConcat",
  "groupNumericIndexedVector",
  "groupUniqArray",
  "group_concat",
  "h3CellAreaM2",
  "h3CellAreaRads2",
  "h3Distance",
  "h3EdgeAngle",
  "h3EdgeLengthKm",
  "h3EdgeLengthM",
  "h3ExactEdgeLengthKm",
  "h3ExactEdgeLengthM",
  "h3ExactEdgeLengthRads",
  "h3GetBaseCell",
  "h3GetDestinationIndexFromUnidirectionalEdge",
  "h3GetFaces",
  "h3GetIndexesFromUnidirectionalEdge",
  "h3GetOriginIndexFromUnidirectionalEdge",
  "h3GetPentagonIndexes",
  "h3GetRes0Indexes",
  "h3GetResolution",
  "h3GetUnidirectionalEdge",
  "h3GetUnidirectionalEdgeBoundary",
  "h3GetUnidirectionalEdgesFromHexagon",
  "h3HexAreaKm2",
  "h3HexAreaM2",
  "h3HexRing",
  "h3IndexesAreNeighbors",
  "h3IsPentagon",
  "h3IsResClassIII",
  "h3IsValid",
  "h3Line",
  "h3NumHexagons",
  "h3PointDistKm",
  "h3PointDistM",
  "h3PointDistRads",
  "h3ToCenterChild",
  "h3ToChildren",
  "h3ToGeo",
  "h3ToGeoBoundary",
  "h3ToParent",
  "h3ToString",
  "h3UnidirectionalEdgeIsValid",
  "h3kRing",
  "halfMD5",
  "has",
  "hasAll",
  "hasAny",
  "hasColumnInTable",
  "hasSubsequence",
  "hasSubsequenceCaseInsensitive",
  "hasSubsequenceCaseInsensitiveUTF8",
  "hasSubsequenceUTF8",
  "hasSubstr",
  "hasThreadFuzzer",
  "hasToken",
  "hasTokenCaseInsensitive",
  "hasTokenCaseInsensitiveOrNull",
  "hasTokenOrNull",
  "hex",
  "hilbertDecode",
  "hilbertEncode",
  "histogram",
  "hiveHash",
  "hop",
  "hopEnd",
  "hopStart",
  "hostName",
  "hostname",
  "hypot",
  "icebergBucket",
  "icebergHash",
  "icebergTruncate",
  "identity",
  "idnaDecode",
  "idnaEncode",
  "if",
  "ifNotFinite",
  "ifNull",
  "ignore",
  // ilike() is a function, but the ILIKE keyword is very common in SQL.
  // 'ilike',
  "inIgnoreSet",
  "indexHint",
  "indexOf",
  "indexOfAssumeSorted",
  "initcap",
  "initcapUTF8",
  "initialQueryID",
  "initialQueryStartTime",
  "initial_query_id",
  "initial_query_start_time",
  "initializeAggregation",
  "instr",
  "intDiv",
  "intDivOrNull",
  "intDivOrZero",
  "intExp10",
  "intExp2",
  "intHash32",
  "intHash64",
  "intervalLengthSum",
  "isConstant",
  "isDecimalOverflow",
  "isDynamicElementInSharedData",
  "isFinite",
  "isIPAddressInRange",
  "isIPv4String",
  "isIPv6String",
  "isInfinite",
  "isMergeTreePartCoveredBy",
  "isNaN",
  "isNotDistinctFrom",
  "isNotNull",
  "isNull",
  "isNullable",
  "isValidJSON",
  "isValidUTF8",
  "isZeroOrNull",
  "jaroSimilarity",
  "jaroWinklerSimilarity",
  "javaHash",
  "javaHashUTF16LE",
  "joinGet",
  "joinGetOrNull",
  "jsonMergePatch",
  "jumpConsistentHash",
  "kafkaMurmurHash",
  "keccak256",
  "kolmogorovSmirnovTest",
  "kostikConsistentHash",
  "kql_array_sort_asc",
  "kql_array_sort_desc",
  "kurtPop",
  "kurtSamp",
  "lag",
  "lagInFrame",
  "largestTriangleThreeBuckets",
  "lastValueRespectNulls",
  "last_value",
  "last_value_respect_nulls",
  "lcase",
  "lcm",
  "lead",
  "leadInFrame",
  "least",
  "left",
  "leftPad",
  "leftPadUTF8",
  "leftUTF8",
  "lemmatize",
  "length",
  "lengthUTF8",
  "less",
  "lessOrEquals",
  "levenshteinDistance",
  "levenshteinDistanceUTF8",
  "lgamma",
  // like() is a function, but the ILIKE keyword is very common in SQL.
  // 'like',
  "ln",
  "locate",
  "log",
  "log10",
  "log1p",
  "log2",
  "logTrace",
  "lowCardinalityIndices",
  "lowCardinalityKeys",
  "lower",
  "lowerUTF8",
  "lpad",
  "ltrim",
  "lttb",
  "makeDate",
  "makeDate32",
  "makeDateTime",
  "makeDateTime64",
  "mannWhitneyUTest",
  "map",
  "mapAdd",
  "mapAll",
  "mapApply",
  "mapConcat",
  "mapContains",
  "mapContainsKey",
  "mapContainsKeyLike",
  "mapContainsValue",
  "mapContainsValueLike",
  "mapExists",
  "mapExtractKeyLike",
  "mapExtractValueLike",
  "mapFilter",
  "mapFromArrays",
  "mapFromString",
  "mapKeys",
  "mapPartialReverseSort",
  "mapPartialSort",
  "mapPopulateSeries",
  "mapReverseSort",
  "mapSort",
  "mapSubtract",
  "mapUpdate",
  "mapValues",
  "match",
  "materialize",
  "max",
  "max2",
  "maxIntersections",
  "maxIntersectionsPosition",
  "maxMappedArrays",
  "meanZTest",
  "median",
  "medianBFloat16",
  "medianBFloat16Weighted",
  "medianDD",
  "medianDeterministic",
  "medianExact",
  "medianExactHigh",
  "medianExactLow",
  "medianExactWeighted",
  "medianExactWeightedInterpolated",
  "medianGK",
  "medianInterpolatedWeighted",
  "medianTDigest",
  "medianTDigestWeighted",
  "medianTiming",
  "medianTimingWeighted",
  "mergeTreePartInfo",
  "metroHash64",
  "mid",
  "min",
  "min2",
  "minMappedArrays",
  "minSampleSizeContinous",
  "minSampleSizeContinuous",
  "minSampleSizeConversion",
  "minus",
  "mismatches",
  "mod",
  "modOrNull",
  "modulo",
  "moduloLegacy",
  "moduloOrNull",
  "moduloOrZero",
  "monthName",
  "mortonDecode",
  "mortonEncode",
  "multiFuzzyMatchAllIndices",
  "multiFuzzyMatchAny",
  "multiFuzzyMatchAnyIndex",
  "multiIf",
  "multiMatchAllIndices",
  "multiMatchAny",
  "multiMatchAnyIndex",
  "multiSearchAllPositions",
  "multiSearchAllPositionsCaseInsensitive",
  "multiSearchAllPositionsCaseInsensitiveUTF8",
  "multiSearchAllPositionsUTF8",
  "multiSearchAny",
  "multiSearchAnyCaseInsensitive",
  "multiSearchAnyCaseInsensitiveUTF8",
  "multiSearchAnyUTF8",
  "multiSearchFirstIndex",
  "multiSearchFirstIndexCaseInsensitive",
  "multiSearchFirstIndexCaseInsensitiveUTF8",
  "multiSearchFirstIndexUTF8",
  "multiSearchFirstPosition",
  "multiSearchFirstPositionCaseInsensitive",
  "multiSearchFirstPositionCaseInsensitiveUTF8",
  "multiSearchFirstPositionUTF8",
  "multiply",
  "multiplyDecimal",
  "murmurHash2_32",
  "murmurHash2_64",
  "murmurHash3_128",
  "murmurHash3_32",
  "murmurHash3_64",
  "negate",
  "neighbor",
  "nested",
  "netloc",
  "ngramDistance",
  "ngramDistanceCaseInsensitive",
  "ngramDistanceCaseInsensitiveUTF8",
  "ngramDistanceUTF8",
  "ngramMinHash",
  "ngramMinHashArg",
  "ngramMinHashArgCaseInsensitive",
  "ngramMinHashArgCaseInsensitiveUTF8",
  "ngramMinHashArgUTF8",
  "ngramMinHashCaseInsensitive",
  "ngramMinHashCaseInsensitiveUTF8",
  "ngramMinHashUTF8",
  "ngramSearch",
  "ngramSearchCaseInsensitive",
  "ngramSearchCaseInsensitiveUTF8",
  "ngramSearchUTF8",
  "ngramSimHash",
  "ngramSimHashCaseInsensitive",
  "ngramSimHashCaseInsensitiveUTF8",
  "ngramSimHashUTF8",
  "ngrams",
  "nonNegativeDerivative",
  "normL1",
  "normL2",
  "normL2Squared",
  "normLinf",
  "normLp",
  "normalizeL1",
  "normalizeL2",
  "normalizeLinf",
  "normalizeLp",
  "normalizeQuery",
  "normalizeQueryKeepNames",
  "normalizeUTF8NFC",
  "normalizeUTF8NFD",
  "normalizeUTF8NFKC",
  "normalizeUTF8NFKD",
  "normalizedQueryHash",
  "normalizedQueryHashKeepNames",
  // not() is a function, but the NOT keyword is very common in SQL.
  // 'not',
  "notEmpty",
  "notEquals",
  "notILike",
  "notIn",
  "notInIgnoreSet",
  "notLike",
  "notNullIn",
  "notNullInIgnoreSet",
  "nothing",
  "nothingNull",
  "nothingUInt64",
  "now",
  "now64",
  "nowInBlock",
  "nowInBlock64",
  "nth_value",
  "ntile",
  "nullIf",
  "nullIn",
  "nullInIgnoreSet",
  "numbers",
  "numericIndexedVectorAllValueSum",
  "numericIndexedVectorBuild",
  "numericIndexedVectorCardinality",
  "numericIndexedVectorGetValue",
  "numericIndexedVectorPointwiseAdd",
  "numericIndexedVectorPointwiseDivide",
  "numericIndexedVectorPointwiseEqual",
  "numericIndexedVectorPointwiseGreater",
  "numericIndexedVectorPointwiseGreaterEqual",
  "numericIndexedVectorPointwiseLess",
  "numericIndexedVectorPointwiseLessEqual",
  "numericIndexedVectorPointwiseMultiply",
  "numericIndexedVectorPointwiseNotEqual",
  "numericIndexedVectorPointwiseSubtract",
  "numericIndexedVectorShortDebugString",
  "numericIndexedVectorToMap",
  "overlay",
  "overlayUTF8",
  "parseDateTime",
  "parseDateTime32BestEffort",
  "parseDateTime32BestEffortOrNull",
  "parseDateTime32BestEffortOrZero",
  "parseDateTime64",
  "parseDateTime64BestEffort",
  "parseDateTime64BestEffortOrNull",
  "parseDateTime64BestEffortOrZero",
  "parseDateTime64BestEffortUS",
  "parseDateTime64BestEffortUSOrNull",
  "parseDateTime64BestEffortUSOrZero",
  "parseDateTime64InJodaSyntax",
  "parseDateTime64InJodaSyntaxOrNull",
  "parseDateTime64InJodaSyntaxOrZero",
  "parseDateTime64OrNull",
  "parseDateTime64OrZero",
  "parseDateTimeBestEffort",
  "parseDateTimeBestEffortOrNull",
  "parseDateTimeBestEffortOrZero",
  "parseDateTimeBestEffortUS",
  "parseDateTimeBestEffortUSOrNull",
  "parseDateTimeBestEffortUSOrZero",
  "parseDateTimeInJodaSyntax",
  "parseDateTimeInJodaSyntaxOrNull",
  "parseDateTimeInJodaSyntaxOrZero",
  "parseDateTimeOrNull",
  "parseDateTimeOrZero",
  "parseReadableSize",
  "parseReadableSizeOrNull",
  "parseReadableSizeOrZero",
  "parseTimeDelta",
  "partitionID",
  "partitionId",
  "path",
  "pathFull",
  "percentRank",
  "percent_rank",
  "pi",
  "plus",
  "pmod",
  "pmodOrNull",
  "pointInEllipses",
  "pointInPolygon",
  "polygonAreaCartesian",
  "polygonAreaSpherical",
  "polygonConvexHullCartesian",
  "polygonPerimeterCartesian",
  "polygonPerimeterSpherical",
  "polygonsDistanceCartesian",
  "polygonsDistanceSpherical",
  "polygonsEqualsCartesian",
  "polygonsIntersectCartesian",
  "polygonsIntersectSpherical",
  "polygonsIntersectionCartesian",
  "polygonsIntersectionSpherical",
  "polygonsSymDifferenceCartesian",
  "polygonsSymDifferenceSpherical",
  "polygonsUnionCartesian",
  "polygonsUnionSpherical",
  "polygonsWithinCartesian",
  "polygonsWithinSpherical",
  "port",
  "portRFC",
  "position",
  "positionCaseInsensitive",
  "positionCaseInsensitiveUTF8",
  "positionUTF8",
  "positiveModulo",
  "positiveModuloOrNull",
  "positive_modulo",
  "positive_modulo_or_null",
  "pow",
  "power",
  "printf",
  "proportionsZTest",
  "protocol",
  "punycodeDecode",
  "punycodeEncode",
  "quantile",
  "quantileBFloat16",
  "quantileBFloat16Weighted",
  "quantileDD",
  "quantileDeterministic",
  "quantileExact",
  "quantileExactExclusive",
  "quantileExactHigh",
  "quantileExactInclusive",
  "quantileExactLow",
  "quantileExactWeighted",
  "quantileExactWeightedInterpolated",
  "quantileGK",
  "quantileInterpolatedWeighted",
  "quantileTDigest",
  "quantileTDigestWeighted",
  "quantileTiming",
  "quantileTimingWeighted",
  "quantiles",
  "quantilesBFloat16",
  "quantilesBFloat16Weighted",
  "quantilesDD",
  "quantilesDeterministic",
  "quantilesExact",
  "quantilesExactExclusive",
  "quantilesExactHigh",
  "quantilesExactInclusive",
  "quantilesExactLow",
  "quantilesExactWeighted",
  "quantilesExactWeightedInterpolated",
  "quantilesGK",
  "quantilesInterpolatedWeighted",
  "quantilesTDigest",
  "quantilesTDigestWeighted",
  "quantilesTiming",
  "quantilesTimingWeighted",
  "queryID",
  "queryString",
  "queryStringAndFragment",
  "query_id",
  "radians",
  "rand",
  "rand32",
  "rand64",
  "randBernoulli",
  "randBinomial",
  "randCanonical",
  "randChiSquared",
  "randConstant",
  "randExponential",
  "randFisherF",
  "randLogNormal",
  "randNegativeBinomial",
  "randNormal",
  "randPoisson",
  "randStudentT",
  "randUniform",
  "randomFixedString",
  "randomPrintableASCII",
  "randomString",
  "randomStringUTF8",
  // range() is a function, but the RANGE keyword is important for window functions.
  // 'range',
  "rank",
  "rankCorr",
  "readWKBLineString",
  "readWKBMultiLineString",
  "readWKBMultiPolygon",
  "readWKBPoint",
  "readWKBPolygon",
  "readWKTLineString",
  "readWKTMultiLineString",
  "readWKTMultiPolygon",
  "readWKTPoint",
  "readWKTPolygon",
  "readWKTRing",
  "regexpExtract",
  "regexpQuoteMeta",
  "regionHierarchy",
  "regionIn",
  "regionToArea",
  "regionToCity",
  "regionToContinent",
  "regionToCountry",
  "regionToDistrict",
  "regionToName",
  "regionToPopulation",
  "regionToTopContinent",
  "reinterpret",
  "reinterpretAsDate",
  "reinterpretAsDateTime",
  "reinterpretAsFixedString",
  "reinterpretAsFloat32",
  "reinterpretAsFloat64",
  "reinterpretAsInt128",
  "reinterpretAsInt16",
  "reinterpretAsInt256",
  "reinterpretAsInt32",
  "reinterpretAsInt64",
  "reinterpretAsInt8",
  "reinterpretAsString",
  "reinterpretAsUInt128",
  "reinterpretAsUInt16",
  "reinterpretAsUInt256",
  "reinterpretAsUInt32",
  "reinterpretAsUInt64",
  "reinterpretAsUInt8",
  "reinterpretAsUUID",
  "repeat",
  "replace",
  "replaceAll",
  "replaceOne",
  "replaceRegexpAll",
  "replaceRegexpOne",
  "replicate",
  "retention",
  "reverse",
  "reverseUTF8",
  "revision",
  "right",
  "rightPad",
  "rightPadUTF8",
  "rightUTF8",
  "round",
  "roundAge",
  "roundBankers",
  "roundDown",
  "roundDuration",
  "roundToExp2",
  "rowNumberInAllBlocks",
  "rowNumberInBlock",
  "row_number",
  "rpad",
  "rtrim",
  "runningAccumulate",
  "runningConcurrency",
  "runningDifference",
  "runningDifferenceStartingWithFirstValue",
  "s2CapContains",
  "s2CapUnion",
  "s2CellsIntersect",
  "s2GetNeighbors",
  "s2RectAdd",
  "s2RectContains",
  "s2RectIntersection",
  "s2RectUnion",
  "s2ToGeo",
  "scalarProduct",
  "searchAll",
  "searchAny",
  "sequenceCount",
  "sequenceMatch",
  "sequenceMatchEvents",
  "sequenceNextNode",
  "seriesDecomposeSTL",
  "seriesOutliersDetectTukey",
  "seriesPeriodDetectFFT",
  "serverTimeZone",
  "serverTimezone",
  "serverUUID",
  "shardCount",
  "shardNum",
  "showCertificate",
  "sigmoid",
  "sign",
  "simpleJSONExtractBool",
  "simpleJSONExtractFloat",
  "simpleJSONExtractInt",
  "simpleJSONExtractRaw",
  "simpleJSONExtractString",
  "simpleJSONExtractUInt",
  "simpleJSONHas",
  "simpleLinearRegression",
  "sin",
  "singleValueOrNull",
  "sinh",
  "sipHash128",
  "sipHash128Keyed",
  "sipHash128Reference",
  "sipHash128ReferenceKeyed",
  "sipHash64",
  "sipHash64Keyed",
  "skewPop",
  "skewSamp",
  "sleep",
  "sleepEachRow",
  "snowflakeIDToDateTime",
  "snowflakeIDToDateTime64",
  "snowflakeToDateTime",
  "snowflakeToDateTime64",
  "soundex",
  "space",
  "sparkBar",
  "sparkbar",
  "sparseGrams",
  "sparseGramsHashes",
  "sparseGramsHashesUTF8",
  "sparseGramsUTF8",
  "splitByAlpha",
  "splitByChar",
  "splitByNonAlpha",
  "splitByRegexp",
  "splitByString",
  "splitByWhitespace",
  "sqid",
  "sqidDecode",
  "sqidEncode",
  "sqrt",
  "startsWith",
  "startsWithUTF8",
  "stddevPop",
  "stddevPopStable",
  "stddevSamp",
  "stddevSampStable",
  "stem",
  "stochasticLinearRegression",
  "stochasticLogisticRegression",
  "str_to_date",
  "str_to_map",
  "stringBytesEntropy",
  "stringBytesUniq",
  "stringJaccardIndex",
  "stringJaccardIndexUTF8",
  "stringToH3",
  "structureToCapnProtoSchema",
  "structureToProtobufSchema",
  "studentTTest",
  "subBitmap",
  "subDate",
  "substr",
  "substring",
  "substringIndex",
  "substringIndexUTF8",
  "substringUTF8",
  "subtractDays",
  "subtractHours",
  "subtractInterval",
  "subtractMicroseconds",
  "subtractMilliseconds",
  "subtractMinutes",
  "subtractMonths",
  "subtractNanoseconds",
  "subtractQuarters",
  "subtractSeconds",
  "subtractTupleOfIntervals",
  "subtractWeeks",
  "subtractYears",
  "sum",
  "sumCount",
  "sumKahan",
  "sumMapFiltered",
  "sumMapFilteredWithOverflow",
  "sumMapWithOverflow",
  "sumMappedArrays",
  "sumWithOverflow",
  "svg",
  "synonyms",
  "tan",
  "tanh",
  "tcpPort",
  "tgamma",
  "theilsU",
  "throwIf",
  "tid",
  "timeDiff",
  "timeSeriesDeltaToGrid",
  "timeSeriesDerivToGrid",
  "timeSeriesFromGrid",
  "timeSeriesGroupArray",
  "timeSeriesIdToTags",
  "timeSeriesIdToTagsGroup",
  "timeSeriesIdeltaToGrid",
  "timeSeriesInstantDeltaToGrid",
  "timeSeriesInstantRateToGrid",
  "timeSeriesIrateToGrid",
  "timeSeriesLastToGrid",
  "timeSeriesLastTwoSamples",
  "timeSeriesPredictLinearToGrid",
  "timeSeriesRange",
  "timeSeriesRateToGrid",
  "timeSeriesResampleToGridWithStaleness",
  "timeSeriesStoreTags",
  "timeSeriesTagsGroupToTags",
  "timeSlot",
  "timeSlots",
  "timeZone",
  "timeZoneOf",
  "timeZoneOffset",
  "time_bucket",
  "timestamp",
  "timestampDiff",
  "timestamp_diff",
  "timezone",
  "timezoneOf",
  "timezoneOffset",
  "toBFloat16",
  "toBFloat16OrNull",
  "toBFloat16OrZero",
  "toBool",
  "toColumnTypeName",
  "toDate",
  "toDate32",
  "toDate32OrDefault",
  "toDate32OrNull",
  "toDate32OrZero",
  "toDateOrDefault",
  "toDateOrNull",
  "toDateOrZero",
  "toDateTime",
  "toDateTime32",
  "toDateTime64",
  "toDateTime64OrDefault",
  "toDateTime64OrNull",
  "toDateTime64OrZero",
  "toDateTimeOrDefault",
  "toDateTimeOrNull",
  "toDateTimeOrZero",
  "toDayOfMonth",
  "toDayOfWeek",
  "toDayOfYear",
  "toDaysSinceYearZero",
  "toDecimal128",
  "toDecimal128OrDefault",
  "toDecimal128OrNull",
  "toDecimal128OrZero",
  "toDecimal256",
  "toDecimal256OrDefault",
  "toDecimal256OrNull",
  "toDecimal256OrZero",
  "toDecimal32",
  "toDecimal32OrDefault",
  "toDecimal32OrNull",
  "toDecimal32OrZero",
  "toDecimal64",
  "toDecimal64OrDefault",
  "toDecimal64OrNull",
  "toDecimal64OrZero",
  "toDecimalString",
  "toFixedString",
  "toFloat32",
  "toFloat32OrDefault",
  "toFloat32OrNull",
  "toFloat32OrZero",
  "toFloat64",
  "toFloat64OrDefault",
  "toFloat64OrNull",
  "toFloat64OrZero",
  "toHour",
  "toIPv4",
  "toIPv4OrDefault",
  "toIPv4OrNull",
  "toIPv4OrZero",
  "toIPv6",
  "toIPv6OrDefault",
  "toIPv6OrNull",
  "toIPv6OrZero",
  "toISOWeek",
  "toISOYear",
  "toInt128",
  "toInt128OrDefault",
  "toInt128OrNull",
  "toInt128OrZero",
  "toInt16",
  "toInt16OrDefault",
  "toInt16OrNull",
  "toInt16OrZero",
  "toInt256",
  "toInt256OrDefault",
  "toInt256OrNull",
  "toInt256OrZero",
  "toInt32",
  "toInt32OrDefault",
  "toInt32OrNull",
  "toInt32OrZero",
  "toInt64",
  "toInt64OrDefault",
  "toInt64OrNull",
  "toInt64OrZero",
  "toInt8",
  "toInt8OrDefault",
  "toInt8OrNull",
  "toInt8OrZero",
  "toInterval",
  "toIntervalDay",
  "toIntervalHour",
  "toIntervalMicrosecond",
  "toIntervalMillisecond",
  "toIntervalMinute",
  "toIntervalMonth",
  "toIntervalNanosecond",
  "toIntervalQuarter",
  "toIntervalSecond",
  "toIntervalWeek",
  "toIntervalYear",
  "toJSONString",
  "toLastDayOfMonth",
  "toLastDayOfWeek",
  "toLowCardinality",
  "toMillisecond",
  "toMinute",
  "toModifiedJulianDay",
  "toModifiedJulianDayOrNull",
  "toMonday",
  "toMonth",
  "toMonthNumSinceEpoch",
  "toNullable",
  "toQuarter",
  "toRelativeDayNum",
  "toRelativeHourNum",
  "toRelativeMinuteNum",
  "toRelativeMonthNum",
  "toRelativeQuarterNum",
  "toRelativeSecondNum",
  "toRelativeWeekNum",
  "toRelativeYearNum",
  "toSecond",
  "toStartOfDay",
  "toStartOfFifteenMinutes",
  "toStartOfFiveMinute",
  "toStartOfFiveMinutes",
  "toStartOfHour",
  "toStartOfISOYear",
  "toStartOfInterval",
  "toStartOfMicrosecond",
  "toStartOfMillisecond",
  "toStartOfMinute",
  "toStartOfMonth",
  "toStartOfNanosecond",
  "toStartOfQuarter",
  "toStartOfSecond",
  "toStartOfTenMinutes",
  "toStartOfWeek",
  "toStartOfYear",
  "toString",
  "toStringCutToZero",
  "toTime",
  "toTime64",
  "toTime64OrNull",
  "toTime64OrZero",
  "toTimeOrNull",
  "toTimeOrZero",
  "toTimeWithFixedDate",
  "toTimeZone",
  "toTimezone",
  "toTypeName",
  "toUInt128",
  "toUInt128OrDefault",
  "toUInt128OrNull",
  "toUInt128OrZero",
  "toUInt16",
  "toUInt16OrDefault",
  "toUInt16OrNull",
  "toUInt16OrZero",
  "toUInt256",
  "toUInt256OrDefault",
  "toUInt256OrNull",
  "toUInt256OrZero",
  "toUInt32",
  "toUInt32OrDefault",
  "toUInt32OrNull",
  "toUInt32OrZero",
  "toUInt64",
  "toUInt64OrDefault",
  "toUInt64OrNull",
  "toUInt64OrZero",
  "toUInt8",
  "toUInt8OrDefault",
  "toUInt8OrNull",
  "toUInt8OrZero",
  "toUTCTimestamp",
  "toUUID",
  "toUUIDOrDefault",
  "toUUIDOrNull",
  "toUUIDOrZero",
  "toUnixTimestamp",
  "toUnixTimestamp64Micro",
  "toUnixTimestamp64Milli",
  "toUnixTimestamp64Nano",
  "toUnixTimestamp64Second",
  "toValidUTF8",
  "toWeek",
  "toYYYYMM",
  "toYYYYMMDD",
  "toYYYYMMDDhhmmss",
  "toYear",
  "toYearNumSinceEpoch",
  "toYearWeek",
  "to_utc_timestamp",
  "today",
  "tokens",
  "topK",
  "topKWeighted",
  "topLevelDomain",
  "topLevelDomainRFC",
  "transactionID",
  "transactionLatestSnapshot",
  "transactionOldestSnapshot",
  "transform",
  "translate",
  "translateUTF8",
  "trim",
  "trimBoth",
  "trimLeft",
  "trimRight",
  "trunc",
  // truncate() is a function, but the TRUNCATE keyword is a statement type.
  // 'truncate',
  "tryBase32Decode",
  "tryBase58Decode",
  "tryBase64Decode",
  "tryBase64URLDecode",
  "tryDecrypt",
  "tryIdnaEncode",
  "tryPunycodeDecode",
  "tumble",
  "tumbleEnd",
  "tumbleStart",
  "tuple",
  "tupleConcat",
  "tupleDivide",
  "tupleDivideByNumber",
  "tupleElement",
  "tupleHammingDistance",
  "tupleIntDiv",
  "tupleIntDivByNumber",
  "tupleIntDivOrZero",
  "tupleIntDivOrZeroByNumber",
  "tupleMinus",
  "tupleModulo",
  "tupleModuloByNumber",
  "tupleMultiply",
  "tupleMultiplyByNumber",
  "tupleNames",
  "tupleNegate",
  "tuplePlus",
  "tupleToNameValuePairs",
  "ucase",
  "unbin",
  "unhex",
  "uniq",
  "uniqCombined",
  "uniqCombined64",
  "uniqExact",
  "uniqHLL12",
  "uniqTheta",
  "uniqThetaIntersect",
  "uniqThetaNot",
  "uniqThetaUnion",
  "uniqUpTo",
  "upper",
  "upperUTF8",
  "uptime",
  "user",
  "validateNestedArraySizes",
  "varPop",
  "varPopStable",
  "varSamp",
  "varSampStable",
  "variantElement",
  "variantType",
  "vectorDifference",
  "vectorSum",
  "version",
  "visibleWidth",
  "visitParamExtractBool",
  "visitParamExtractFloat",
  "visitParamExtractInt",
  "visitParamExtractRaw",
  "visitParamExtractString",
  "visitParamExtractUInt",
  "visitParamHas",
  "week",
  "welchTTest",
  "widthBucket",
  "width_bucket",
  "windowFunnel",
  "windowID",
  "wkb",
  "wkt",
  "wordShingleMinHash",
  "wordShingleMinHashArg",
  "wordShingleMinHashArgCaseInsensitive",
  "wordShingleMinHashArgCaseInsensitiveUTF8",
  "wordShingleMinHashArgUTF8",
  "wordShingleMinHashCaseInsensitive",
  "wordShingleMinHashCaseInsensitiveUTF8",
  "wordShingleMinHashUTF8",
  "wordShingleSimHash",
  "wordShingleSimHashCaseInsensitive",
  "wordShingleSimHashCaseInsensitiveUTF8",
  "wordShingleSimHashUTF8",
  "wyHash64",
  "xor",
  "xxHash32",
  "xxHash64",
  "xxh3",
  "yandexConsistentHash",
  "yearweek",
  "yesterday",
  "zookeeperSessionUptime",
  // Table Engines
  // https://clickhouse.com/docs/engines/table-engines
  "MergeTree",
  "ReplacingMergeTree",
  "SummingMergeTree",
  "AggregatingMergeTree",
  "CollapsingMergeTree",
  "VersionedCollapsingMergeTree",
  "GraphiteMergeTree",
  "CoalescingMergeTree",
  // Database Engines
  // https://clickhouse.com/docs/engines/database-engines
  "Atomic",
  "Shared",
  "Lazy",
  "Replicated",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  // Disabling this because it's more likely to be used in a GRANT statement as a permission.
  // 'Backup',
  "MaterializedPostgreSQL",
  "DataLakeCatalog"
];

// node_modules/sql-formatter/dist/esm/languages/clickhouse/clickhouse.keywords.js
var keywords2 = [
  // Derived from https://github.com/ClickHouse/ClickHouse/blob/827a7ef9f6d727ef511fea7785a1243541509efb/tests/fuzz/dictionaries/keywords.dict#L4
  "ACCESS",
  "ACTION",
  "ADD",
  "ADMIN",
  "AFTER",
  "ALGORITHM",
  "ALIAS",
  "ALL",
  "ALLOWED_LATENESS",
  "ALTER",
  "AND",
  "ANTI",
  "APPEND",
  "APPLY",
  "AS",
  "ASC",
  "ASCENDING",
  "ASOF",
  "ASSUME",
  "AST",
  "ASYNC",
  "ATTACH",
  "AUTO_INCREMENT",
  "AZURE",
  "BACKUP",
  "BAGEXPANSION",
  "BASE_BACKUP",
  "BCRYPT_HASH",
  "BCRYPT_PASSWORD",
  "BEGIN",
  "BETWEEN",
  "BIDIRECTIONAL",
  "BOTH",
  "BY",
  "CACHE",
  "CACHES",
  "CASCADE",
  "CASE",
  "CHANGE",
  "CHANGEABLE_IN_READONLY",
  "CHANGED",
  "CHARACTER",
  "CHECK",
  "CLEANUP",
  "CLEAR",
  "CLUSTER",
  "CLUSTERS",
  "CLUSTER_HOST_IDS",
  "CN",
  "CODEC",
  "COLLATE",
  "COLLECTION",
  "COLUMN",
  "COLUMNS",
  "COMMENT",
  "COMMIT",
  "COMPRESSION",
  "CONST",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "CUBE",
  "CURRENT",
  "D",
  "DATA",
  "DATABASE",
  "DATABASES",
  "DAYS",
  "DD",
  "DDL",
  "DEDUPLICATE",
  "DEFAULT",
  "DEFINER",
  "DELAY",
  "DELETE",
  "DELETED",
  "DEPENDS",
  "DESC",
  "DESCENDING",
  "DESCRIBE",
  "DETACH",
  "DETACHED",
  "DICTIONARIES",
  "DICTIONARY",
  "DISK",
  "DISTINCT",
  "DIV",
  "DOUBLE_SHA1_HASH",
  "DOUBLE_SHA1_PASSWORD",
  "DROP",
  "ELSE",
  "ENABLED",
  "END",
  "ENFORCED",
  "ENGINE",
  "ENGINES",
  "EPHEMERAL",
  "ESTIMATE",
  "EVENT",
  "EVENTS",
  "EVERY",
  "EXCEPT",
  "EXCHANGE",
  "EXISTS",
  "EXPLAIN",
  "EXPRESSION",
  "EXTENDED",
  "EXTERNAL",
  "FAKE",
  "FALSE",
  "FETCH",
  "FIELDS",
  "FILESYSTEM",
  "FILL",
  "FILTER",
  "FINAL",
  "FIRST",
  "FOLLOWING",
  "FOR",
  "FOREIGN",
  "FORMAT",
  "FREEZE",
  "FROM",
  "FULL",
  "FULLTEXT",
  "FUNCTION",
  "FUNCTIONS",
  "GLOBAL",
  "GRANT",
  "GRANTEES",
  "GRANTS",
  "GRANULARITY",
  "GROUP",
  "GROUPING",
  "GROUPS",
  "H",
  "HASH",
  "HAVING",
  "HDFS",
  "HH",
  "HIERARCHICAL",
  "HOST",
  "HOURS",
  "HTTP",
  // Disabling this because it's a keyword, but formats far more than
  // it should.
  // 'ID',
  "IDENTIFIED",
  "ILIKE",
  "IN",
  "INDEX",
  "INDEXES",
  "INDICES",
  "INFILE",
  "INHERIT",
  "INJECTIVE",
  "INNER",
  "INSERT",
  "INTERPOLATE",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "INVISIBLE",
  "INVOKER",
  "IP",
  "IS",
  "IS_OBJECT_ID",
  "JOIN",
  "JWT",
  "KERBEROS",
  "KEY",
  "KEYED",
  "KEYS",
  "KILL",
  "KIND",
  "LARGE",
  "LAST",
  "LAYOUT",
  "LDAP",
  "LEADING",
  "LEVEL",
  "LIFETIME",
  "LIGHTWEIGHT",
  "LIKE",
  "LIMIT",
  "LIMITS",
  "LINEAR",
  "LIST",
  "LIVE",
  "LOCAL",
  "M",
  "MASK",
  "MATERIALIZED",
  "MCS",
  "MEMORY",
  "MERGES",
  "METRICS",
  "MI",
  "MICROSECOND",
  "MICROSECONDS",
  "MILLISECONDS",
  "MINUTES",
  "MM",
  "MODIFY",
  "MONTHS",
  "MOVE",
  "MS",
  "MUTATION",
  "N",
  "NAME",
  "NAMED",
  "NANOSECOND",
  "NANOSECONDS",
  "NEXT",
  "NO",
  "NONE",
  "NOT",
  "NO_PASSWORD",
  "NS",
  "NULL",
  "NULLS",
  "OBJECT",
  "OFFSET",
  "ON",
  "ONLY",
  "OPTIMIZE",
  "OPTION",
  "OR",
  "ORDER",
  "OUTER",
  "OUTFILE",
  "OVER",
  "OVERRIDABLE",
  "OVERRIDE",
  "PART",
  "PARTIAL",
  "PARTITION",
  "PARTITIONS",
  "PART_MOVE_TO_SHARD",
  "PASTE",
  "PERIODIC",
  "PERMANENTLY",
  "PERMISSIVE",
  "PERSISTENT",
  "PIPELINE",
  "PLAINTEXT_PASSWORD",
  "PLAN",
  "POLICY",
  "POPULATE",
  "PRECEDING",
  "PRECISION",
  "PREWHERE",
  "PRIMARY",
  "PRIVILEGES",
  "PROCESSLIST",
  "PROFILE",
  "PROJECTION",
  "PROTOBUF",
  "PULL",
  "Q",
  "QQ",
  "QUALIFY",
  "QUARTERS",
  "QUERY",
  "QUOTA",
  "RANDOMIZE",
  "RANDOMIZED",
  "RANGE",
  "READONLY",
  "REALM",
  "RECOMPRESS",
  "RECURSIVE",
  "REFERENCES",
  "REFRESH",
  "REGEXP",
  "REMOVE",
  "RENAME",
  "RESET",
  "RESPECT",
  "RESTORE",
  "RESTRICT",
  "RESTRICTIVE",
  "RESUME",
  "REVOKE",
  "ROLE",
  "ROLES",
  "ROLLBACK",
  "ROLLUP",
  "ROW",
  "ROWS",
  "S",
  "S3",
  "SALT",
  "SAMPLE",
  "SAN",
  "SCHEME",
  "SECONDS",
  "SECURITY",
  "SELECT",
  "SEMI",
  "SEQUENTIAL",
  "SERVER",
  "SET",
  "SETS",
  "SETTING",
  "SETTINGS",
  "SHA256_HASH",
  "SHA256_PASSWORD",
  "SHARD",
  "SHOW",
  "SIGNED",
  "SIMPLE",
  "SNAPSHOT",
  "SOURCE",
  "SPATIAL",
  "SQL",
  "SQL_TSI_DAY",
  "SQL_TSI_HOUR",
  "SQL_TSI_MICROSECOND",
  "SQL_TSI_MILLISECOND",
  "SQL_TSI_MINUTE",
  "SQL_TSI_MONTH",
  "SQL_TSI_NANOSECOND",
  "SQL_TSI_QUARTER",
  "SQL_TSI_SECOND",
  "SQL_TSI_WEEK",
  "SQL_TSI_YEAR",
  "SS",
  "SSH_KEY",
  "SSL_CERTIFICATE",
  "STALENESS",
  "START",
  "STATISTICS",
  "STDOUT",
  "STEP",
  "STORAGE",
  "STRICT",
  "STRICTLY_ASCENDING",
  "SUBPARTITION",
  "SUBPARTITIONS",
  "SUSPEND",
  "SYNC",
  "SYNTAX",
  "SYSTEM",
  "TABLE",
  "TABLES",
  "TAGS",
  "TEMPORARY",
  "TEST",
  "THAN",
  "THEN",
  "TIES",
  "TIME",
  "TO",
  "TOP",
  "TOTALS",
  "TRACKING",
  "TRAILING",
  "TRANSACTION",
  "TREE",
  "TRIGGER",
  "TRUE",
  "TRUNCATE",
  "TTL",
  "TYPE",
  "TYPEOF",
  "UNBOUNDED",
  "UNDROP",
  "UNFREEZE",
  "UNION",
  "UNIQUE",
  "UNSET",
  "UNSIGNED",
  "UNTIL",
  "UPDATE",
  "URL",
  "USE",
  "USING",
  "UUID",
  "VALID",
  "VALUES",
  "VARYING",
  "VIEW",
  "VISIBLE",
  "VOLUME",
  "WATCH",
  "WATERMARK",
  "WEEKS",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITH_ITEMINDEX",
  "WK",
  "WRITABLE",
  "WW",
  "YEARS",
  "YY",
  "YYYY",
  "ZKPATH"
];
var dataTypes2 = [
  // Derived from `SELECT name FROM system.data_type_families ORDER BY name` on Clickhouse Cloud
  // as of November 14, 2025.
  "AGGREGATEFUNCTION",
  "ARRAY",
  "BFLOAT16",
  "BIGINT",
  "BIGINT SIGNED",
  "BIGINT UNSIGNED",
  "BINARY",
  "BINARY LARGE OBJECT",
  "BINARY VARYING",
  "BIT",
  "BLOB",
  "BYTE",
  "BYTEA",
  "BOOL",
  "CHAR",
  "CHAR LARGE OBJECT",
  "CHAR VARYING",
  "CHARACTER",
  "CHARACTER LARGE OBJECT",
  "CHARACTER VARYING",
  "CLOB",
  "DEC",
  "DOUBLE",
  "DOUBLE PRECISION",
  "DATE",
  "DATE32",
  "DATETIME",
  "DATETIME32",
  "DATETIME64",
  "DECIMAL",
  "DECIMAL128",
  "DECIMAL256",
  "DECIMAL32",
  "DECIMAL64",
  "DYNAMIC",
  "ENUM",
  "ENUM",
  "ENUM16",
  "ENUM8",
  "FIXED",
  "FLOAT",
  "FIXEDSTRING",
  "FLOAT32",
  "FLOAT64",
  "GEOMETRY",
  "INET4",
  "INET6",
  "INT",
  "INT SIGNED",
  "INT UNSIGNED",
  "INT1",
  "INT1 SIGNED",
  "INT1 UNSIGNED",
  "INTEGER",
  "INTEGER SIGNED",
  "INTEGER UNSIGNED",
  "IPV4",
  "IPV6",
  "INT128",
  "INT16",
  "INT256",
  "INT32",
  "INT64",
  "INT8",
  "INTERVALDAY",
  "INTERVALHOUR",
  "INTERVALMICROSECOND",
  "INTERVALMILLISECOND",
  "INTERVALMINUTE",
  "INTERVALMONTH",
  "INTERVALNANOSECOND",
  "INTERVALQUARTER",
  "INTERVALSECOND",
  "INTERVALWEEK",
  "INTERVALYEAR",
  "JSON",
  "LONGBLOB",
  "LONGTEXT",
  "LINESTRING",
  "LOWCARDINALITY",
  "MEDIUMBLOB",
  "MEDIUMINT",
  "MEDIUMINT SIGNED",
  "MEDIUMINT UNSIGNED",
  "MEDIUMTEXT",
  "MAP",
  "MULTILINESTRING",
  "MULTIPOLYGON",
  "NATIONAL CHAR",
  "NATIONAL CHAR VARYING",
  "NATIONAL CHARACTER",
  "NATIONAL CHARACTER LARGE OBJECT",
  "NATIONAL CHARACTER VARYING",
  "NCHAR",
  "NCHAR LARGE OBJECT",
  "NCHAR VARYING",
  "NUMERIC",
  "NVARCHAR",
  "NESTED",
  "NOTHING",
  "NULLABLE",
  "OBJECT",
  "POINT",
  "POLYGON",
  "REAL",
  "RING",
  "SET",
  "SIGNED",
  "SINGLE",
  "SMALLINT",
  "SMALLINT SIGNED",
  "SMALLINT UNSIGNED",
  "SIMPLEAGGREGATEFUNCTION",
  "STRING",
  "TEXT",
  "TIMESTAMP",
  "TINYBLOB",
  "TINYINT",
  "TINYINT SIGNED",
  "TINYINT UNSIGNED",
  "TINYTEXT",
  "TIME",
  "TIME64",
  "TUPLE",
  "UINT128",
  "UINT16",
  "UINT256",
  "UINT32",
  "UINT64",
  "UINT8",
  "UNSIGNED",
  "UUID",
  "VARBINARY",
  "VARCHAR",
  "VARCHAR2",
  "VARIANT",
  "YEAR",
  "BOOL",
  "BOOLEAN"
];

// node_modules/sql-formatter/dist/esm/languages/clickhouse/clickhouse.formatter.js
var reservedSelect2 = expandPhrases([
  "SELECT [DISTINCT]",
  // https://clickhouse.com/docs/sql-reference/statements/alter/view
  "MODIFY QUERY SELECT [DISTINCT]"
]);
var reservedClauses2 = expandPhrases([
  "SET",
  // https://clickhouse.com/docs/sql-reference/statements/select
  "WITH",
  "FROM",
  "SAMPLE",
  "PREWHERE",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "QUALIFY",
  "ORDER BY",
  "LIMIT",
  "SETTINGS",
  "INTO OUTFILE",
  "FORMAT",
  // https://clickhouse.com/docs/sql-reference/window-functions
  "WINDOW",
  "PARTITION BY",
  // https://clickhouse.com/docs/sql-reference/statements/insert-into
  "INSERT INTO",
  "VALUES",
  // https://clickhouse.com/docs/sql-reference/statements/create/view#refreshable-materialized-view
  "DEPENDS ON",
  // https://clickhouse.com/docs/sql-reference/statements/move
  "MOVE {USER | ROLE | QUOTA | SETTINGS PROFILE | ROW POLICY}",
  // https://clickhouse.com/docs/sql-reference/statements/grant
  "GRANT",
  // https://clickhouse.com/docs/sql-reference/statements/revoke
  "REVOKE",
  // https://clickhouse.com/docs/sql-reference/statements/check-grant
  "CHECK GRANT",
  // https://clickhouse.com/docs/sql-reference/statements/set-role
  "SET [DEFAULT] ROLE [NONE | ALL | ALL EXCEPT]",
  // https://clickhouse.com/docs/sql-reference/statements/optimize
  "DEDUPLICATE BY",
  // https://clickhouse.com/docs/sql-reference/statements/alter/statistics
  "MODIFY STATISTICS",
  // Used for ALTER INDEX ... TYPE and ALTER STATISTICS ... TYPE
  "TYPE",
  // https://clickhouse.com/docs/sql-reference/statements/alter
  "ALTER USER [IF EXISTS]",
  "ALTER [ROW] POLICY [IF EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/drop
  "DROP {USER | ROLE | QUOTA | PROFILE | SETTINGS PROFILE | ROW POLICY | POLICY} [IF EXISTS]"
]);
var standardOnelineClauses2 = expandPhrases([
  // https://clickhouse.com/docs/sql-reference/statements/create
  "CREATE [OR REPLACE] [TEMPORARY] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses2 = expandPhrases([
  "ALL EXCEPT",
  "ON CLUSTER",
  // https://clickhouse.com/docs/sql-reference/statements/update
  "UPDATE",
  // https://clickhouse.com/docs/sql-reference/statements/system
  "SYSTEM RELOAD {DICTIONARIES | DICTIONARY | FUNCTIONS | FUNCTION | ASYNCHRONOUS METRICS}",
  "SYSTEM DROP {DNS CACHE | MARK CACHE | ICEBERG METADATA CACHE | TEXT INDEX DICTIONARY CACHE | TEXT INDEX HEADER CACHE | TEXT INDEX POSTINGS CACHE | REPLICA | DATABASE REPLICA | UNCOMPRESSED CACHE | COMPILED EXPRESSION CACHE | QUERY CONDITION CACHE | QUERY CACHE | FORMAT SCHEMA CACHE | FILESYSTEM CACHE}",
  "SYSTEM FLUSH LOGS",
  "SYSTEM RELOAD {CONFIG | USERS}",
  "SYSTEM SHUTDOWN",
  "SYSTEM KILL",
  "SYSTEM FLUSH DISTRIBUTED",
  "SYSTEM START DISTRIBUTED SENDS",
  "SYSTEM {STOP | START} {LISTEN | MERGES | TTL MERGES | MOVES | FETCHES | REPLICATED SENDS | REPLICATION QUEUES | PULLING REPLICATION LOG}",
  "SYSTEM {SYNC | RESTART | RESTORE} REPLICA",
  "SYSTEM {SYNC | RESTORE} DATABASE REPLICA",
  "SYSTEM RESTART REPLICAS",
  "SYSTEM UNFREEZE",
  "SYSTEM WAIT LOADING PARTS",
  "SYSTEM {LOAD | UNLOAD} PRIMARY KEY",
  "SYSTEM {STOP | START} [REPLICATED] VIEW",
  "SYSTEM {STOP | START} VIEWS",
  "SYSTEM {REFRESH | CANCEL | WAIT} VIEW",
  "WITH NAME",
  // https://clickhouse.com/docs/sql-reference/statements/show
  "SHOW [CREATE] {TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE}",
  "SHOW DATABASES [[NOT] {LIKE | ILIKE}]",
  "SHOW [FULL] [TEMPORARY] TABLES [FROM | IN]",
  "SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN}",
  // https://clickhouse.com/docs/sql-reference/statements/attach
  "ATTACH {TABLE | DICTIONARY | DATABASE} [IF NOT EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/detach
  "DETACH {TABLE | DICTIONARY | DATABASE} [IF EXISTS]",
  "PERMANENTLY",
  "SYNC",
  // https://clickhouse.com/docs/sql-reference/statements/drop
  "DROP {DICTIONARY | DATABASE | PROFILE | VIEW | FUNCTION | NAMED COLLECTION} [IF EXISTS]",
  "DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]",
  // https://clickhouse.com/docs/sql-reference/statements/alter/table#rename
  "RENAME TO",
  // https://clickhouse.com/docs/sql-reference/statements/exists
  "EXISTS [TEMPORARY] {TABLE | DICTIONARY | DATABASE}",
  // https://clickhouse.com/docs/sql-reference/statements/kill
  "KILL QUERY",
  // https://clickhouse.com/docs/sql-reference/statements/optimize
  "OPTIMIZE TABLE",
  // https://clickhouse.com/docs/sql-reference/statements/rename
  "RENAME {TABLE | DICTIONARY | DATABASE}",
  // https://clickhouse.com/docs/sql-reference/statements/exchange
  "EXCHANGE {TABLES | DICTIONARIES}",
  // https://clickhouse.com/docs/sql-reference/statements/truncate
  "TRUNCATE TABLE [IF EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/execute_as
  "EXECUTE AS",
  // https://clickhouse.com/docs/sql-reference/statements/use
  "USE",
  "TO",
  // https://clickhouse.com/docs/sql-reference/statements/undrop
  "UNDROP TABLE",
  // https://clickhouse.com/docs/sql-reference/statements/create
  "CREATE {DATABASE | NAMED COLLECTION} [IF NOT EXISTS]",
  "CREATE [OR REPLACE] {VIEW | DICTIONARY} [IF NOT EXISTS]",
  "CREATE MATERIALIZED VIEW [IF NOT EXISTS]",
  "CREATE FUNCTION",
  "CREATE {USER | ROLE | QUOTA | SETTINGS PROFILE} [IF NOT EXISTS | OR REPLACE]",
  "CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE]",
  // https://clickhouse.com/docs/sql-reference/statements/create/table#replace-table
  "REPLACE [TEMPORARY] TABLE [IF NOT EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/alter
  "ALTER {ROLE | QUOTA | SETTINGS PROFILE} [IF EXISTS]",
  "ALTER [TEMPORARY] TABLE",
  "ALTER NAMED COLLECTION [IF EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/alter/user
  "GRANTEES",
  "NOT IDENTIFIED",
  "RESET AUTHENTICATION METHODS TO NEW",
  "{IDENTIFIED | ADD IDENTIFIED} [WITH | BY]",
  "[ADD | DROP] HOST {LOCAL | NAME | REGEXP | IP | LIKE}",
  "VALID UNTIL",
  "DROP [ALL] {PROFILES | SETTINGS}",
  "{ADD | MODIFY} SETTINGS",
  "ADD PROFILES",
  // https://clickhouse.com/docs/sql-reference/statements/alter/apply-deleted-mask
  "APPLY DELETED MASK",
  "IN PARTITION",
  // https://clickhouse.com/docs/sql-reference/statements/alter/column
  "{ADD | DROP | RENAME | CLEAR | COMMENT | MODIFY | ALTER | MATERIALIZE} COLUMN",
  // https://clickhouse.com/docs/sql-reference/statements/alter/partition
  "{DETACH | DROP | ATTACH | FETCH | MOVE} {PART | PARTITION}",
  "DROP DETACHED {PART | PARTITION}",
  "{FORGET | REPLACE} PARTITION",
  "CLEAR COLUMN",
  "{FREEZE | UNFREEZE} [PARTITION]",
  "CLEAR INDEX",
  "TO {DISK | VOLUME}",
  "[DELETE | REWRITE PARTS] IN PARTITION",
  // https://clickhouse.com/docs/sql-reference/statements/alter/setting
  "{MODIFY | RESET} SETTING",
  // https://clickhouse.com/docs/sql-reference/statements/alter/delete
  "DELETE WHERE",
  // https://clickhouse.com/docs/sql-reference/statements/alter/order-by
  "MODIFY ORDER BY",
  // https://clickhouse.com/docs/sql-reference/statements/alter/sample-by
  "{MODIFY | REMOVE} SAMPLE BY",
  // https://clickhouse.com/docs/sql-reference/statements/alter/skipping-index
  "{ADD | MATERIALIZE | CLEAR} INDEX [IF NOT EXISTS]",
  "DROP INDEX [IF EXISTS]",
  "GRANULARITY",
  "AFTER",
  "FIRST",
  // https://clickhouse.com/docs/sql-reference/statements/alter/constraint
  "ADD CONSTRAINT [IF NOT EXISTS]",
  "DROP CONSTRAINT [IF EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/alter/ttl
  "MODIFY TTL",
  "REMOVE TTL",
  // https://clickhouse.com/docs/sql-reference/statements/alter/statistics
  "ADD STATISTICS [IF NOT EXISTS]",
  "{DROP | CLEAR} STATISTICS [IF EXISTS]",
  "MATERIALIZE STATISTICS [ALL | IF EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/alter/quota
  "KEYED BY",
  "NOT KEYED",
  "FOR [RANDOMIZED] INTERVAL",
  // https://clickhouse.com/docs/sql-reference/statements/alter/row-policy
  "AS {PERMISSIVE | RESTRICTIVE}",
  "FOR SELECT",
  // https://clickhouse.com/docs/sql-reference/statements/alter/projection
  "ADD PROJECTION [IF NOT EXISTS]",
  "{DROP | MATERIALIZE | CLEAR} PROJECTION [IF EXISTS]",
  // https://clickhouse.com/docs/sql-reference/statements/create/view#refreshable-materialized-view
  "REFRESH {EVERY | AFTER}",
  "RANDOMIZE FOR",
  "APPEND",
  "APPEND TO",
  // https://clickhouse.com/docs/sql-reference/statements/delete
  "DELETE FROM",
  // https://clickhouse.com/docs/sql-reference/statements/explain
  "EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE]",
  // https://clickhouse.com/docs/sql-reference/statements/grant
  "GRANT ON CLUSTER",
  "GRANT CURRENT GRANTS",
  "WITH GRANT OPTION",
  // https://clickhouse.com/docs/sql-reference/statements/revoke
  "REVOKE ON CLUSTER",
  "ADMIN OPTION FOR",
  // https://clickhouse.com/docs/sql-reference/statements/check-table
  "CHECK TABLE",
  "PARTITION ID",
  // https://clickhouse.com/docs/sql-reference/statements/describe-table
  "{DESC | DESCRIBE} TABLE"
]);
var reservedSetOperations2 = expandPhrases([
  // https://clickhouse.com/docs/sql-reference/statements/select/union
  "UNION [ALL | DISTINCT]",
  // https://clickhouse.com/docs/sql-reference/statements/parallel_with
  "PARALLEL WITH"
]);
var reservedJoins2 = expandPhrases([
  // https://clickhouse.com/docs/sql-reference/statements/select/join
  "[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN",
  // https://clickhouse.com/docs/sql-reference/statements/select/array-join
  "[LEFT] ARRAY JOIN"
]);
var reservedKeywordPhrases2 = expandPhrases([
  "{ROWS | RANGE} BETWEEN",
  "ALTER MATERIALIZE STATISTICS"
]);
var clickhouse = {
  name: "clickhouse",
  tokenizerOptions: {
    reservedSelect: reservedSelect2,
    reservedClauses: [...reservedClauses2, ...standardOnelineClauses2, ...tabularOnelineClauses2],
    reservedSetOperations: reservedSetOperations2,
    reservedJoins: reservedJoins2,
    reservedKeywordPhrases: reservedKeywordPhrases2,
    reservedKeywords: keywords2,
    reservedDataTypes: dataTypes2,
    reservedFunctionNames: functions2,
    extraParens: ["[]", "{}"],
    lineCommentTypes: ["#", "--"],
    nestedBlockComments: false,
    underscoresInNumbers: true,
    stringTypes: ["$$", "''-qq-bs"],
    identTypes: ['""-qq-bs', "``"],
    paramTypes: {
      // https://clickhouse.com/docs/sql-reference/syntax#defining-and-using-query-parameters
      custom: [
        {
          // Parameters are like {foo:Uint64} or {foo:Map(String, String)}
          // We include `'` in the negated character class to be a little sneaky:
          // map literals have quoted keys, and we use this to avoid confusing
          // them for named parameters. This means that the map literal `{'foo':1}`
          // will be formatted as `{'foo': 1}` rather than `{foo: 1}`.
          regex: String.raw`\{[^:']+:[^}]+\}`,
          key: (v) => {
            const match = /\{([^:]+):/.exec(v);
            return match ? match[1].trim() : v;
          }
        }
      ]
    },
    operators: [
      // Strings, arithmetic
      "%",
      "||",
      // Ternary
      "?",
      ":",
      // Comparison
      "==",
      "<=>",
      // Lambda creation
      "->"
    ],
    postProcess: postProcess2
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses2, ...tabularOnelineClauses2],
    tabularOnelineClauses: tabularOnelineClauses2
  }
};
function postProcess2(tokens) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    const prevToken = tokens[i - 1] || EOF_TOKEN;
    if (token.type === TokenType.RESERVED_SELECT && (nextToken.type === TokenType.COMMA || prevToken.type === TokenType.RESERVED_CLAUSE || prevToken.type === TokenType.COMMA)) {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_KEYWORD });
    }
    if (isToken.SET(token) && nextToken.type === TokenType.OPEN_PAREN) {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_FUNCTION_NAME });
    }
    return token;
  });
}

// node_modules/sql-formatter/dist/esm/languages/db2/db2.functions.js
var functions3 = [
  // https://www.ibm.com/docs/en/db2/11.5?topic=bif-aggregate-functions
  "ARRAY_AGG",
  "AVG",
  "CORRELATION",
  "COUNT",
  "COUNT_BIG",
  "COVARIANCE",
  "COVARIANCE_SAMP",
  "CUME_DIST",
  "GROUPING",
  "LISTAGG",
  "MAX",
  "MEDIAN",
  "MIN",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PERCENT_RANK",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_ICPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  "STDDEV",
  "STDDEV_SAMP",
  "SUM",
  "VARIANCE",
  "VARIANCE_SAMP",
  "XMLAGG",
  "XMLGROUP",
  // https://www.ibm.com/docs/en/db2/11.5?topic=bif-scalar-functions
  "ABS",
  "ABSVAL",
  "ACOS",
  "ADD_DAYS",
  "ADD_HOURS",
  "ADD_MINUTES",
  "ADD_MONTHS",
  "ADD_SECONDS",
  "ADD_YEARS",
  "AGE",
  "ARRAY_DELETE",
  "ARRAY_FIRST",
  "ARRAY_LAST",
  "ARRAY_NEXT",
  "ARRAY_PRIOR",
  "ASCII",
  "ASCII_STR",
  "ASIN",
  "ATAN",
  "ATAN2",
  "ATANH",
  "BITAND",
  "BITANDNOT",
  "BITOR",
  "BITXOR",
  "BITNOT",
  "BPCHAR",
  "BSON_TO_JSON",
  "BTRIM",
  "CARDINALITY",
  "CEILING",
  "CEIL",
  "CHARACTER_LENGTH",
  "CHR",
  "COALESCE",
  "COLLATION_KEY",
  "COLLATION_KEY_BIT",
  "COMPARE_DECFLOAT",
  "CONCAT",
  "COS",
  "COSH",
  "COT",
  "CURSOR_ROWCOUNT",
  "DATAPARTITIONNUM",
  "DATE_PART",
  "DATE_TRUNC",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFWEEK_ISO",
  "DAYOFYEAR",
  "DAYS",
  "DAYS_BETWEEN",
  "DAYS_TO_END_OF_MONTH",
  "DBPARTITIONNUM",
  "DECFLOAT",
  "DECFLOAT_FORMAT",
  "DECODE",
  "DECRYPT_BIN",
  "DECRYPT_CHAR",
  "DEGREES",
  "DEREF",
  "DIFFERENCE",
  "DIGITS",
  "DOUBLE_PRECISION",
  "EMPTY_BLOB",
  "EMPTY_CLOB",
  "EMPTY_DBCLOB",
  "EMPTY_NCLOB",
  "ENCRYPT",
  "EVENT_MON_STATE",
  "EXP",
  "EXTRACT",
  "FIRST_DAY",
  "FLOOR",
  "FROM_UTC_TIMESTAMP",
  "GENERATE_UNIQUE",
  "GETHINT",
  "GREATEST",
  "HASH",
  "HASH4",
  "HASH8",
  "HASHEDVALUE",
  "HEX",
  "HEXTORAW",
  "HOUR",
  "HOURS_BETWEEN",
  "IDENTITY_VAL_LOCAL",
  "IFNULL",
  "INITCAP",
  "INSERT",
  "INSTR",
  "INSTR2",
  "INSTR4",
  "INSTRB",
  "INTNAND",
  "INTNOR",
  "INTNXOR",
  "INTNNOT",
  "ISNULL",
  "JSON_ARRAY",
  "JSON_OBJECT",
  "JSON_QUERY",
  "JSON_TO_BSON",
  "JSON_VALUE",
  "JULIAN_DAY",
  "LAST_DAY",
  "LCASE",
  "LEAST",
  "LEFT",
  "LENGTH",
  "LENGTH2",
  "LENGTH4",
  "LENGTHB",
  "LN",
  "LOCATE",
  "LOCATE_IN_STRING",
  "LOG10",
  "LONG_VARCHAR",
  "LONG_VARGRAPHIC",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MAX",
  "MAX_CARDINALITY",
  "MICROSECOND",
  "MIDNIGHT_SECONDS",
  "MIN",
  "MINUTE",
  "MINUTES_BETWEEN",
  "MOD",
  "MONTH",
  "MONTHNAME",
  "MONTHS_BETWEEN",
  "MULTIPLY_ALT",
  "NEXT_DAY",
  "NEXT_MONTH",
  "NEXT_QUARTER",
  "NEXT_WEEK",
  "NEXT_YEAR",
  "NORMALIZE_DECFLOAT",
  "NOW",
  "NULLIF",
  "NVL",
  "NVL2",
  "OCTET_LENGTH",
  "OVERLAY",
  "PARAMETER",
  "POSITION",
  "POSSTR",
  "POW",
  "POWER",
  "QUANTIZE",
  "QUARTER",
  "QUOTE_IDENT",
  "QUOTE_LITERAL",
  "RADIANS",
  "RAISE_ERROR",
  "RAND",
  "RANDOM",
  "RAWTOHEX",
  "REC2XML",
  "REGEXP_COUNT",
  "REGEXP_EXTRACT",
  "REGEXP_INSTR",
  "REGEXP_LIKE",
  "REGEXP_MATCH_COUNT",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "REPEAT",
  "REPLACE",
  "RID",
  "RID_BIT",
  "RIGHT",
  "ROUND",
  "ROUND_TIMESTAMP",
  "RPAD",
  "RTRIM",
  "SECLABEL",
  "SECLABEL_BY_NAME",
  "SECLABEL_TO_CHAR",
  "SECOND",
  "SECONDS_BETWEEN",
  "SIGN",
  "SIN",
  "SINH",
  "SOUNDEX",
  "SPACE",
  "SQRT",
  "STRIP",
  "STRLEFT",
  "STRPOS",
  "STRRIGHT",
  "SUBSTR",
  "SUBSTR2",
  "SUBSTR4",
  "SUBSTRB",
  "SUBSTRING",
  "TABLE_NAME",
  "TABLE_SCHEMA",
  "TAN",
  "TANH",
  "THIS_MONTH",
  "THIS_QUARTER",
  "THIS_WEEK",
  "THIS_YEAR",
  "TIMESTAMP_FORMAT",
  "TIMESTAMP_ISO",
  "TIMESTAMPDIFF",
  "TIMEZONE",
  "TO_CHAR",
  "TO_CLOB",
  "TO_DATE",
  "TO_HEX",
  "TO_MULTI_BYTE",
  "TO_NCHAR",
  "TO_NCLOB",
  "TO_NUMBER",
  "TO_SINGLE_BYTE",
  "TO_TIMESTAMP",
  "TO_UTC_TIMESTAMP",
  "TOTALORDER",
  "TRANSLATE",
  "TRIM",
  "TRIM_ARRAY",
  "TRUNC_TIMESTAMP",
  "TRUNCATE",
  "TRUNC",
  "TYPE_ID",
  "TYPE_NAME",
  "TYPE_SCHEMA",
  "UCASE",
  "UNICODE_STR",
  "UPPER",
  "VALUE",
  "VARCHAR_BIT_FORMAT",
  "VARCHAR_FORMAT",
  "VARCHAR_FORMAT_BIT",
  "VERIFY_GROUP_FOR_USER",
  "VERIFY_ROLE_FOR_USER",
  "VERIFY_TRUSTED_CONTEXT_ROLE_FOR_USER",
  "WEEK",
  "WEEK_ISO",
  "WEEKS_BETWEEN",
  "WIDTH_BUCKET",
  "XMLATTRIBUTES",
  "XMLCOMMENT",
  "XMLCONCAT",
  "XMLDOCUMENT",
  "XMLELEMENT",
  "XMLFOREST",
  "XMLNAMESPACES",
  "XMLPARSE",
  "XMLPI",
  "XMLQUERY",
  "XMLROW",
  "XMLSERIALIZE",
  "XMLTEXT",
  "XMLVALIDATE",
  "XMLXSROBJECTID",
  "XSLTRANSFORM",
  "YEAR",
  "YEARS_BETWEEN",
  "YMD_BETWEEN",
  // https://www.ibm.com/docs/en/db2/11.5?topic=bif-table-functions
  "BASE_TABLE",
  "JSON_TABLE",
  "UNNEST",
  "XMLTABLE",
  // https://www.ibm.com/docs/en/db2/11.5?topic=expressions-olap-specification
  // Additional function names not already present in the aggregate functions list
  "RANK",
  "DENSE_RANK",
  "NTILE",
  "LAG",
  "LEAD",
  "ROW_NUMBER",
  "FIRST_VALUE",
  "LAST_VALUE",
  "NTH_VALUE",
  "RATIO_TO_REPORT",
  // Type casting
  "CAST"
];

// node_modules/sql-formatter/dist/esm/languages/db2/db2.keywords.js
var keywords3 = [
  // https://www.ibm.com/docs/en/db2/11.5?topic=sql-reserved-schema-names-reserved-words
  "ACTIVATE",
  "ADD",
  "AFTER",
  "ALIAS",
  "ALL",
  "ALLOCATE",
  "ALLOW",
  "ALTER",
  "AND",
  "ANY",
  "AS",
  "ASENSITIVE",
  "ASSOCIATE",
  "ASUTIME",
  "AT",
  "ATTRIBUTES",
  "AUDIT",
  "AUTHORIZATION",
  "AUX",
  "AUXILIARY",
  "BEFORE",
  "BEGIN",
  "BETWEEN",
  "BINARY",
  "BUFFERPOOL",
  "BY",
  "CACHE",
  "CALL",
  "CALLED",
  "CAPTURE",
  "CARDINALITY",
  "CASCADED",
  "CASE",
  "CAST",
  "CHECK",
  "CLONE",
  "CLOSE",
  "CLUSTER",
  "COLLECTION",
  "COLLID",
  "COLUMN",
  "COMMENT",
  "COMMIT",
  "CONCAT",
  "CONDITION",
  "CONNECT",
  "CONNECTION",
  "CONSTRAINT",
  "CONTAINS",
  "CONTINUE",
  "COUNT",
  "COUNT_BIG",
  "CREATE",
  "CROSS",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_LC_CTYPE",
  "CURRENT_PATH",
  "CURRENT_SCHEMA",
  "CURRENT_SERVER",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_TIMEZONE",
  "CURRENT_USER",
  "CURSOR",
  "CYCLE",
  "DATA",
  "DATABASE",
  "DATAPARTITIONNAME",
  "DATAPARTITIONNUM",
  "DAY",
  "DAYS",
  "DB2GENERAL",
  "DB2GENRL",
  "DB2SQL",
  "DBINFO",
  "DBPARTITIONNAME",
  "DBPARTITIONNUM",
  "DEALLOCATE",
  "DECLARE",
  "DEFAULT",
  "DEFAULTS",
  "DEFINITION",
  "DELETE",
  "DENSERANK",
  "DENSE_RANK",
  "DESCRIBE",
  "DESCRIPTOR",
  "DETERMINISTIC",
  "DIAGNOSTICS",
  "DISABLE",
  "DISALLOW",
  "DISCONNECT",
  "DISTINCT",
  "DO",
  "DOCUMENT",
  "DROP",
  "DSSIZE",
  "DYNAMIC",
  "EACH",
  "EDITPROC",
  "ELSE",
  "ELSEIF",
  "ENABLE",
  "ENCODING",
  "ENCRYPTION",
  "END",
  "END-EXEC",
  "ENDING",
  "ERASE",
  "ESCAPE",
  "EVERY",
  "EXCEPT",
  "EXCEPTION",
  "EXCLUDING",
  "EXCLUSIVE",
  "EXECUTE",
  "EXISTS",
  "EXIT",
  "EXPLAIN",
  "EXTENDED",
  "EXTERNAL",
  "EXTRACT",
  "FENCED",
  "FETCH",
  "FIELDPROC",
  "FILE",
  "FINAL",
  "FIRST1",
  "FOR",
  "FOREIGN",
  "FREE",
  "FROM",
  "FULL",
  "FUNCTION",
  "GENERAL",
  "GENERATED",
  "GET",
  "GLOBAL",
  "GO",
  "GOTO",
  "GRANT",
  "GRAPHIC",
  "GROUP",
  "HANDLER",
  "HASH",
  "HASHED_VALUE",
  "HAVING",
  "HINT",
  "HOLD",
  "HOUR",
  "HOURS",
  "IDENTITY",
  "IF",
  "IMMEDIATE",
  "IMPORT",
  "IN",
  "INCLUDING",
  "INCLUSIVE",
  "INCREMENT",
  "INDEX",
  "INDICATOR",
  "INDICATORS",
  "INF",
  "INFINITY",
  "INHERIT",
  "INNER",
  "INOUT",
  "INSENSITIVE",
  "INSERT",
  "INTEGRITY",
  "INTERSECT",
  "INTO",
  "IS",
  "ISNULL",
  "ISOBID",
  "ISOLATION",
  "ITERATE",
  "JAR",
  "JAVA",
  "JOIN",
  "KEEP",
  "KEY",
  "LABEL",
  "LANGUAGE",
  "LAST3",
  "LATERAL",
  "LC_CTYPE",
  "LEAVE",
  "LEFT",
  "LIKE",
  "LIMIT",
  "LINKTYPE",
  "LOCAL",
  "LOCALDATE",
  "LOCALE",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCATOR",
  "LOCATORS",
  "LOCK",
  "LOCKMAX",
  "LOCKSIZE",
  "LOOP",
  "MAINTAINED",
  "MATERIALIZED",
  "MAXVALUE",
  "MICROSECOND",
  "MICROSECONDS",
  "MINUTE",
  "MINUTES",
  "MINVALUE",
  "MODE",
  "MODIFIES",
  "MONTH",
  "MONTHS",
  "NAN",
  "NEW",
  "NEW_TABLE",
  "NEXTVAL",
  "NO",
  "NOCACHE",
  "NOCYCLE",
  "NODENAME",
  "NODENUMBER",
  "NOMAXVALUE",
  "NOMINVALUE",
  "NONE",
  "NOORDER",
  "NORMALIZED",
  "NOT2",
  "NOTNULL",
  "NULL",
  "NULLS",
  "NUMPARTS",
  "OBID",
  "OF",
  "OFF",
  "OFFSET",
  "OLD",
  "OLD_TABLE",
  "ON",
  "OPEN",
  "OPTIMIZATION",
  "OPTIMIZE",
  "OPTION",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OVER",
  "OVERRIDING",
  "PACKAGE",
  "PADDED",
  "PAGESIZE",
  "PARAMETER",
  "PART",
  "PARTITION",
  "PARTITIONED",
  "PARTITIONING",
  "PARTITIONS",
  "PASSWORD",
  "PATH",
  "PERCENT",
  "PIECESIZE",
  "PLAN",
  "POSITION",
  "PRECISION",
  "PREPARE",
  "PREVVAL",
  "PRIMARY",
  "PRIQTY",
  "PRIVILEGES",
  "PROCEDURE",
  "PROGRAM",
  "PSID",
  "PUBLIC",
  "QUERY",
  "QUERYNO",
  "RANGE",
  "RANK",
  "READ",
  "READS",
  "RECOVERY",
  "REFERENCES",
  "REFERENCING",
  "REFRESH",
  "RELEASE",
  "RENAME",
  "REPEAT",
  "RESET",
  "RESIGNAL",
  "RESTART",
  "RESTRICT",
  "RESULT",
  "RESULT_SET_LOCATOR",
  "RETURN",
  "RETURNS",
  "REVOKE",
  "RIGHT",
  "ROLE",
  "ROLLBACK",
  "ROUND_CEILING",
  "ROUND_DOWN",
  "ROUND_FLOOR",
  "ROUND_HALF_DOWN",
  "ROUND_HALF_EVEN",
  "ROUND_HALF_UP",
  "ROUND_UP",
  "ROUTINE",
  "ROW",
  "ROWNUMBER",
  "ROWS",
  "ROWSET",
  "ROW_NUMBER",
  "RRN",
  "RUN",
  "SAVEPOINT",
  "SCHEMA",
  "SCRATCHPAD",
  "SCROLL",
  "SEARCH",
  "SECOND",
  "SECONDS",
  "SECQTY",
  "SECURITY",
  "SELECT",
  "SENSITIVE",
  "SEQUENCE",
  "SESSION",
  "SESSION_USER",
  "SET",
  "SIGNAL",
  "SIMPLE",
  "SNAN",
  "SOME",
  "SOURCE",
  "SPECIFIC",
  "SQL",
  "SQLID",
  "STACKED",
  "STANDARD",
  "START",
  "STARTING",
  "STATEMENT",
  "STATIC",
  "STATMENT",
  "STAY",
  "STOGROUP",
  "STORES",
  "STYLE",
  "SUBSTRING",
  "SUMMARY",
  "SYNONYM",
  "SYSFUN",
  "SYSIBM",
  "SYSPROC",
  "SYSTEM",
  "SYSTEM_USER",
  "TABLE",
  "TABLESPACE",
  "THEN",
  "TO",
  "TRANSACTION",
  "TRIGGER",
  "TRIM",
  "TRUNCATE",
  "TYPE",
  "UNDO",
  "UNION",
  "UNIQUE",
  "UNTIL",
  "UPDATE",
  "USAGE",
  "USER",
  "USING",
  "VALIDPROC",
  "VALUE",
  "VALUES",
  "VARIABLE",
  "VARIANT",
  "VCAT",
  "VERSION",
  "VIEW",
  "VOLATILE",
  "VOLUMES",
  "WHEN",
  "WHENEVER",
  "WHERE",
  "WHILE",
  "WITH",
  "WITHOUT",
  "WLM",
  "WRITE",
  "XMLELEMENT",
  "XMLEXISTS",
  "XMLNAMESPACES",
  "YEAR",
  "YEARS"
];
var dataTypes3 = [
  // https://www.ibm.com/docs/en/db2-for-zos/12?topic=columns-data-types
  "ARRAY",
  "BIGINT",
  "BINARY",
  "BLOB",
  "BOOLEAN",
  "CCSID",
  "CHAR",
  "CHARACTER",
  "CLOB",
  "DATE",
  "DATETIME",
  "DBCLOB",
  "DEC",
  "DECIMAL",
  "DOUBLE",
  "DOUBLE PRECISION",
  "FLOAT",
  "FLOAT4",
  "FLOAT8",
  "GRAPHIC",
  "INT",
  "INT2",
  "INT4",
  "INT8",
  "INTEGER",
  "INTERVAL",
  "LONG VARCHAR",
  "LONG VARGRAPHIC",
  "NCHAR",
  "NCHR",
  "NCLOB",
  "NVARCHAR",
  "NUMERIC",
  "SMALLINT",
  "REAL",
  "TIME",
  "TIMESTAMP",
  "VARBINARY",
  "VARCHAR",
  "VARGRAPHIC"
];

// node_modules/sql-formatter/dist/esm/languages/db2/db2.formatter.js
var reservedSelect3 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses3 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY [INPUT SEQUENCE]",
  "LIMIT",
  "OFFSET",
  "FETCH NEXT",
  "FOR UPDATE [OF]",
  "FOR {READ | FETCH} ONLY",
  "FOR {RR | CS | UR | RS} [USE AND KEEP {SHARE | UPDATE | EXCLUSIVE} LOCKS]",
  "WAIT FOR OUTCOME",
  "SKIP LOCKED DATA",
  "INTO",
  // Data modification
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  "INSERT"
]);
var standardOnelineClauses3 = expandPhrases([
  "CREATE [GLOBAL TEMPORARY | EXTERNAL] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses3 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] VIEW",
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  "WITH {RR | RS | CS | UR}",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "DROP [COLUMN]",
  "RENAME COLUMN",
  "ALTER [COLUMN]",
  "SET DATA TYPE",
  "SET NOT NULL",
  "DROP {DEFAULT | GENERATED | NOT NULL}",
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://www.ibm.com/docs/en/db2/11.5?topic=s-statements
  "ALLOCATE",
  "ALTER AUDIT POLICY",
  "ALTER BUFFERPOOL",
  "ALTER DATABASE PARTITION GROUP",
  "ALTER DATABASE",
  "ALTER EVENT MONITOR",
  "ALTER FUNCTION",
  "ALTER HISTOGRAM TEMPLATE",
  "ALTER INDEX",
  "ALTER MASK",
  "ALTER METHOD",
  "ALTER MODULE",
  "ALTER NICKNAME",
  "ALTER PACKAGE",
  "ALTER PERMISSION",
  "ALTER PROCEDURE",
  "ALTER SCHEMA",
  "ALTER SECURITY LABEL COMPONENT",
  "ALTER SECURITY POLICY",
  "ALTER SEQUENCE",
  "ALTER SERVER",
  "ALTER SERVICE CLASS",
  "ALTER STOGROUP",
  "ALTER TABLESPACE",
  "ALTER THRESHOLD",
  "ALTER TRIGGER",
  "ALTER TRUSTED CONTEXT",
  "ALTER TYPE",
  "ALTER USAGE LIST",
  "ALTER USER MAPPING",
  "ALTER VIEW",
  "ALTER WORK ACTION SET",
  "ALTER WORK CLASS SET",
  "ALTER WORKLOAD",
  "ALTER WRAPPER",
  "ALTER XSROBJECT",
  "ALTER STOGROUP",
  "ALTER TABLESPACE",
  "ALTER TRIGGER",
  "ALTER TRUSTED CONTEXT",
  "ALTER VIEW",
  "ASSOCIATE [RESULT SET] {LOCATOR | LOCATORS}",
  "AUDIT",
  "BEGIN DECLARE SECTION",
  "CALL",
  "CLOSE",
  "COMMENT ON",
  "COMMIT [WORK]",
  "CONNECT",
  "CREATE [OR REPLACE] [PUBLIC] ALIAS",
  "CREATE AUDIT POLICY",
  "CREATE BUFFERPOOL",
  "CREATE DATABASE PARTITION GROUP",
  "CREATE EVENT MONITOR",
  "CREATE [OR REPLACE] FUNCTION",
  "CREATE FUNCTION MAPPING",
  "CREATE HISTOGRAM TEMPLATE",
  "CREATE [UNIQUE] INDEX",
  "CREATE INDEX EXTENSION",
  "CREATE [OR REPLACE] MASK",
  "CREATE [SPECIFIC] METHOD",
  "CREATE [OR REPLACE] MODULE",
  "CREATE [OR REPLACE] NICKNAME",
  "CREATE [OR REPLACE] PERMISSION",
  "CREATE [OR REPLACE] PROCEDURE",
  "CREATE ROLE",
  "CREATE SCHEMA",
  "CREATE SECURITY LABEL [COMPONENT]",
  "CREATE SECURITY POLICY",
  "CREATE [OR REPLACE] SEQUENCE",
  "CREATE SERVICE CLASS",
  "CREATE SERVER",
  "CREATE STOGROUP",
  "CREATE SYNONYM",
  "CREATE [LARGE | REGULAR | {SYSTEM | USER} TEMPORARY] TABLESPACE",
  "CREATE THRESHOLD",
  "CREATE {TRANSFORM | TRANSFORMS} FOR",
  "CREATE [OR REPLACE] TRIGGER",
  "CREATE TRUSTED CONTEXT",
  "CREATE [OR REPLACE] TYPE",
  "CREATE TYPE MAPPING",
  "CREATE USAGE LIST",
  "CREATE USER MAPPING FOR",
  "CREATE [OR REPLACE] VARIABLE",
  "CREATE WORK ACTION SET",
  "CREATE WORK CLASS SET",
  "CREATE WORKLOAD",
  "CREATE WRAPPER",
  "DECLARE",
  "DECLARE GLOBAL TEMPORARY TABLE",
  "DESCRIBE [INPUT | OUTPUT]",
  "DISCONNECT",
  "DROP [PUBLIC] ALIAS",
  "DROP AUDIT POLICY",
  "DROP BUFFERPOOL",
  "DROP DATABASE PARTITION GROUP",
  "DROP EVENT MONITOR",
  "DROP [SPECIFIC] FUNCTION",
  "DROP FUNCTION MAPPING",
  "DROP HISTOGRAM TEMPLATE",
  "DROP INDEX [EXTENSION]",
  "DROP MASK",
  "DROP [SPECIFIC] METHOD",
  "DROP MODULE",
  "DROP NICKNAME",
  "DROP PACKAGE",
  "DROP PERMISSION",
  "DROP [SPECIFIC] PROCEDURE",
  "DROP ROLE",
  "DROP SCHEMA",
  "DROP SECURITY LABEL [COMPONENT]",
  "DROP SECURITY POLICY",
  "DROP SEQUENCE",
  "DROP SERVER",
  "DROP SERVICE CLASS",
  "DROP STOGROUP",
  "DROP TABLE HIERARCHY",
  "DROP {TABLESPACE | TABLESPACES}",
  "DROP {TRANSFORM | TRANSFORMS}",
  "DROP THRESHOLD",
  "DROP TRIGGER",
  "DROP TRUSTED CONTEXT",
  "DROP TYPE [MAPPING]",
  "DROP USAGE LIST",
  "DROP USER MAPPING FOR",
  "DROP VARIABLE",
  "DROP VIEW [HIERARCHY]",
  "DROP WORK {ACTION | CLASS} SET",
  "DROP WORKLOAD",
  "DROP WRAPPER",
  "DROP XSROBJECT",
  "END DECLARE SECTION",
  "EXECUTE [IMMEDIATE]",
  "EXPLAIN {PLAN [SECTION] | ALL}",
  "FETCH [FROM]",
  "FLUSH {BUFFERPOOL | BUFFERPOOLS} ALL",
  "FLUSH EVENT MONITOR",
  "FLUSH FEDERATED CACHE",
  "FLUSH OPTIMIZATION PROFILE CACHE",
  "FLUSH PACKAGE CACHE [DYNAMIC]",
  "FLUSH AUTHENTICATION CACHE [FOR ALL]",
  "FREE LOCATOR",
  "GET DIAGNOSTICS",
  "GOTO",
  "GRANT",
  "INCLUDE",
  "ITERATE",
  "LEAVE",
  "LOCK TABLE",
  "LOOP",
  "OPEN",
  "PIPE",
  "PREPARE",
  "REFRESH TABLE",
  "RELEASE",
  "RELEASE [TO] SAVEPOINT",
  "RENAME [TABLE | INDEX | STOGROUP | TABLESPACE]",
  "REPEAT",
  "RESIGNAL",
  "RETURN",
  "REVOKE",
  "ROLLBACK [WORK] [TO SAVEPOINT]",
  "SAVEPOINT",
  "SET COMPILATION ENVIRONMENT",
  "SET CONNECTION",
  "SET CURRENT",
  "SET ENCRYPTION PASSWORD",
  "SET EVENT MONITOR STATE",
  "SET INTEGRITY",
  "SET PASSTHRU",
  "SET PATH",
  "SET ROLE",
  "SET SCHEMA",
  "SET SERVER OPTION",
  "SET {SESSION AUTHORIZATION | SESSION_USER}",
  "SET USAGE LIST",
  "SIGNAL",
  "TRANSFER OWNERSHIP OF",
  "WHENEVER {NOT FOUND | SQLERROR | SQLWARNING}",
  "WHILE"
]);
var reservedSetOperations3 = expandPhrases(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"]);
var reservedJoins3 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN"
]);
var reservedKeywordPhrases3 = expandPhrases([
  "ON DELETE",
  "ON UPDATE",
  "SET NULL",
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases2 = expandPhrases([]);
var db2 = {
  name: "db2",
  tokenizerOptions: {
    reservedSelect: reservedSelect3,
    reservedClauses: [...reservedClauses3, ...standardOnelineClauses3, ...tabularOnelineClauses3],
    reservedSetOperations: reservedSetOperations3,
    reservedJoins: reservedJoins3,
    reservedKeywordPhrases: reservedKeywordPhrases3,
    reservedDataTypePhrases: reservedDataTypePhrases2,
    reservedKeywords: keywords3,
    reservedDataTypes: dataTypes3,
    reservedFunctionNames: functions3,
    extraParens: ["[]"],
    stringTypes: [
      { quote: "''-qq", prefixes: ["G", "N", "U&"] },
      { quote: "''-raw", prefixes: ["X", "BX", "GX", "UX"], requirePrefix: true }
    ],
    identTypes: [`""-qq`],
    identChars: { first: "@#$", rest: "@#$" },
    paramTypes: { positional: true, named: [":"] },
    paramChars: { first: "@#$", rest: "@#$" },
    operators: [
      "**",
      "%",
      "|",
      "&",
      "^",
      "~",
      "\xAC=",
      "\xAC>",
      "\xAC<",
      "!>",
      "!<",
      "^=",
      "^>",
      "^<",
      "||",
      "->",
      "=>"
    ]
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses3, ...tabularOnelineClauses3],
    tabularOnelineClauses: tabularOnelineClauses3
  }
};

// node_modules/sql-formatter/dist/esm/languages/db2i/db2i.functions.js
var functions4 = [
  // https://www.ibm.com/docs/en/i/7.5?topic=functions-aggregate
  // TODO: 'ANY', - conflicts with test for ANY predicate in 'operators.ys'!!
  "ARRAY_AGG",
  "AVG",
  "CORR",
  "CORRELATION",
  "COUNT",
  "COUNT_BIG",
  "COVAR_POP",
  "COVARIANCE",
  "COVAR",
  "COVAR_SAMP",
  "COVARIANCE_SAMP",
  "EVERY",
  "GROUPING",
  "JSON_ARRAYAGG",
  "JSON_OBJECTAGG",
  "LISTAGG",
  "MAX",
  "MEDIAN",
  "MIN",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  // https://www.ibm.com/docs/en/i/7.5?topic=functions-regression'
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  "SOME",
  "STDDEV_POP",
  "STDDEV",
  "STDDEV_SAMP",
  "SUM",
  "VAR_POP",
  "VARIANCE",
  "VAR",
  "VAR_SAMP",
  "VARIANCE_SAMP",
  "XMLAGG",
  "XMLGROUP",
  // https://www.ibm.com/docs/en/i/7.5?topic=functions-scalar
  "ABS",
  "ABSVAL",
  "ACOS",
  "ADD_DAYS",
  "ADD_HOURS",
  "ADD_MINUTES",
  "ADD_MONTHS",
  "ADD_SECONDS",
  "ADD_YEARS",
  "ANTILOG",
  "ARRAY_MAX_CARDINALITY",
  "ARRAY_TRIM",
  "ASCII",
  "ASIN",
  "ATAN",
  "ATAN2",
  "ATANH",
  "BASE64_DECODE",
  "BASE64_ENCODE",
  "BIT_LENGTH",
  "BITAND",
  "BITANDNOT",
  "BITNOT",
  "BITOR",
  "BITXOR",
  "BSON_TO_JSON",
  "CARDINALITY",
  "CEIL",
  "CEILING",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "CHR",
  "COALESCE",
  "COMPARE_DECFLOAT",
  "CONCAT",
  "CONTAINS",
  "COS",
  "COSH",
  "COT",
  "CURDATE",
  "CURTIME",
  "DATABASE",
  "DATAPARTITIONNAME",
  "DATAPARTITIONNUM",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK_ISO",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DAYS",
  "DBPARTITIONNAME",
  "DBPARTITIONNUM",
  "DECFLOAT_FORMAT",
  "DECFLOAT_SORTKEY",
  "DECRYPT_BINARY",
  "DECRYPT_BIT",
  "DECRYPT_CHAR",
  "DECRYPT_DB",
  "DEGREES",
  "DIFFERENCE",
  "DIGITS",
  "DLCOMMENT",
  "DLLINKTYPE",
  "DLURLCOMPLETE",
  "DLURLPATH",
  "DLURLPATHONLY",
  "DLURLSCHEME",
  "DLURLSERVER",
  "DLVALUE",
  "DOUBLE_PRECISION",
  "DOUBLE",
  "ENCRPYT",
  "ENCRYPT_AES",
  "ENCRYPT_AES256",
  "ENCRYPT_RC2",
  "ENCRYPT_TDES",
  "EXP",
  "EXTRACT",
  "FIRST_DAY",
  "FLOOR",
  "GENERATE_UNIQUE",
  "GET_BLOB_FROM_FILE",
  "GET_CLOB_FROM_FILE",
  "GET_DBCLOB_FROM_FILE",
  "GET_XML_FILE",
  "GETHINT",
  "GREATEST",
  "HASH_MD5",
  "HASH_ROW",
  "HASH_SHA1",
  "HASH_SHA256",
  "HASH_SHA512",
  "HASH_VALUES",
  "HASHED_VALUE",
  "HEX",
  "HEXTORAW",
  "HOUR",
  "HTML_ENTITY_DECODE",
  "HTML_ENTITY_ENCODE",
  "HTTP_DELETE_BLOB",
  "HTTP_DELETE",
  "HTTP_GET_BLOB",
  "HTTP_GET",
  "HTTP_PATCH_BLOB",
  "HTTP_PATCH",
  "HTTP_POST_BLOB",
  "HTTP_POST",
  "HTTP_PUT_BLOB",
  "HTTP_PUT",
  "IDENTITY_VAL_LOCAL",
  "IFNULL",
  "INSERT",
  "INSTR",
  "INTERPRET",
  "ISFALSE",
  "ISNOTFALSE",
  "ISNOTTRUE",
  "ISTRUE",
  "JSON_ARRAY",
  "JSON_OBJECT",
  "JSON_QUERY",
  "JSON_TO_BSON",
  "JSON_UPDATE",
  "JSON_VALUE",
  "JULIAN_DAY",
  "LAND",
  "LAST_DAY",
  "LCASE",
  "LEAST",
  "LEFT",
  "LENGTH",
  "LN",
  "LNOT",
  "LOCATE_IN_STRING",
  "LOCATE",
  "LOG10",
  "LOR",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MAX_CARDINALITY",
  "MAX",
  "MICROSECOND",
  "MIDNIGHT_SECONDS",
  "MIN",
  "MINUTE",
  "MOD",
  "MONTH",
  "MONTHNAME",
  "MONTHS_BETWEEN",
  "MQREAD",
  "MQREADCLOB",
  "MQRECEIVE",
  "MQRECEIVECLOB",
  "MQSEND",
  "MULTIPLY_ALT",
  "NEXT_DAY",
  "NORMALIZE_DECFLOAT",
  "NOW",
  "NULLIF",
  "NVL",
  "OCTET_LENGTH",
  "OVERLAY",
  "PI",
  "POSITION",
  "POSSTR",
  "POW",
  "POWER",
  "QUANTIZE",
  "QUARTER",
  "RADIANS",
  "RAISE_ERROR",
  "RANDOM",
  "RAND",
  "REGEXP_COUNT",
  "REGEXP_INSTR",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "REPEAT",
  "REPLACE",
  "RID",
  "RIGHT",
  "ROUND_TIMESTAMP",
  "ROUND",
  "RPAD",
  "RRN",
  "RTRIM",
  "SCORE",
  "SECOND",
  "SIGN",
  "SIN",
  "SINH",
  "SOUNDEX",
  "SPACE",
  "SQRT",
  "STRIP",
  "STRLEFT",
  "STRPOS",
  "STRRIGHT",
  "SUBSTR",
  "SUBSTRING",
  "TABLE_NAME",
  "TABLE_SCHEMA",
  "TAN",
  "TANH",
  "TIMESTAMP_FORMAT",
  "TIMESTAMP_ISO",
  "TIMESTAMPDIFF_BIG",
  "TIMESTAMPDIFF",
  "TO_CHAR",
  "TO_CLOB",
  "TO_DATE",
  "TO_NUMBER",
  "TO_TIMESTAMP",
  "TOTALORDER",
  "TRANSLATE",
  "TRIM_ARRAY",
  "TRIM",
  "TRUNC_TIMESTAMP",
  "TRUNC",
  "TRUNCATE",
  "UCASE",
  "UPPER",
  "URL_DECODE",
  "URL_ENCODE",
  "VALUE",
  "VARBINARY_FORMAT",
  "VARCHAR_BIT_FORMAT",
  "VARCHAR_FORMAT_BINARY",
  "VARCHAR_FORMAT",
  "VERIFY_GROUP_FOR_USER",
  "WEEK_ISO",
  "WEEK",
  "WRAP",
  "XMLATTRIBUTES",
  "XMLCOMMENT",
  "XMLCONCAT",
  "XMLDOCUMENT",
  "XMLELEMENT",
  "XMLFOREST",
  "XMLNAMESPACES",
  "XMLPARSE",
  "XMLPI",
  "XMLROW",
  "XMLSERIALIZE",
  "XMLTEXT",
  "XMLVALIDATE",
  "XOR",
  "XSLTRANSFORM",
  "YEAR",
  "ZONED",
  // https://www.ibm.com/docs/en/i/7.5?topic=functions-table
  "BASE_TABLE",
  "HTTP_DELETE_BLOB_VERBOSE",
  "HTTP_DELETE_VERBOSE",
  "HTTP_GET_BLOB_VERBOSE",
  "HTTP_GET_VERBOSE",
  "HTTP_PATCH_BLOB_VERBOSE",
  "HTTP_PATCH_VERBOSE",
  "HTTP_POST_BLOB_VERBOSE",
  "HTTP_POST_VERBOSE",
  "HTTP_PUT_BLOB_VERBOSE",
  "HTTP_PUT_VERBOSE",
  "JSON_TABLE",
  "MQREADALL",
  "MQREADALLCLOB",
  "MQRECEIVEALL",
  "MQRECEIVEALLCLOB",
  "XMLTABLE",
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-row
  "UNPACK",
  // https://www.ibm.com/docs/en/i/7.5?topic=expressions-olap-specifications
  "CUME_DIST",
  "DENSE_RANK",
  "FIRST_VALUE",
  "LAG",
  "LAST_VALUE",
  "LEAD",
  "NTH_VALUE",
  "NTILE",
  "PERCENT_RANK",
  "RANK",
  "RATIO_TO_REPORT",
  "ROW_NUMBER",
  // Type casting
  "CAST"
];

// node_modules/sql-formatter/dist/esm/languages/db2i/db2i.keywords.js
var keywords4 = [
  // https://www.ibm.com/docs/en/i/7.5?topic=words-reserved
  // TODO: This list likely contains all keywords, not only the reserved ones,
  // try to filter it down to just the reserved keywords.
  "ABSENT",
  "ACCORDING",
  "ACCTNG",
  "ACTION",
  "ACTIVATE",
  "ADD",
  "ALIAS",
  "ALL",
  "ALLOCATE",
  "ALLOW",
  "ALTER",
  "AND",
  "ANY",
  "APPEND",
  "APPLNAME",
  "ARRAY",
  "ARRAY_AGG",
  "ARRAY_TRIM",
  "AS",
  "ASC",
  "ASENSITIVE",
  "ASSOCIATE",
  "ATOMIC",
  "ATTACH",
  "ATTRIBUTES",
  "AUTHORIZATION",
  "AUTONOMOUS",
  "BEFORE",
  "BEGIN",
  "BETWEEN",
  "BIND",
  "BSON",
  "BUFFERPOOL",
  "BY",
  "CACHE",
  "CALL",
  "CALLED",
  "CARDINALITY",
  "CASE",
  "CAST",
  "CHECK",
  "CL",
  "CLOSE",
  "CLUSTER",
  "COLLECT",
  "COLLECTION",
  "COLUMN",
  "COMMENT",
  "COMMIT",
  "COMPACT",
  "COMPARISONS",
  "COMPRESS",
  "CONCAT",
  "CONCURRENT",
  "CONDITION",
  "CONNECT",
  "CONNECT_BY_ROOT",
  "CONNECTION",
  "CONSTANT",
  "CONSTRAINT",
  "CONTAINS",
  "CONTENT",
  "CONTINUE",
  "COPY",
  "COUNT",
  "COUNT_BIG",
  "CREATE",
  "CREATEIN",
  "CROSS",
  "CUBE",
  "CUME_DIST",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_PATH",
  "CURRENT_SCHEMA",
  "CURRENT_SERVER",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_TIMEZONE",
  "CURRENT_USER",
  "CURSOR",
  "CYCLE",
  "DATABASE",
  "DATAPARTITIONNAME",
  "DATAPARTITIONNUM",
  "DAY",
  "DAYS",
  "DB2GENERAL",
  "DB2GENRL",
  "DB2SQL",
  "DBINFO",
  "DBPARTITIONNAME",
  "DBPARTITIONNUM",
  "DEACTIVATE",
  "DEALLOCATE",
  "DECLARE",
  "DEFAULT",
  "DEFAULTS",
  "DEFER",
  "DEFINE",
  "DEFINITION",
  "DELETE",
  "DELETING",
  "DENSE_RANK",
  "DENSERANK",
  "DESC",
  "DESCRIBE",
  "DESCRIPTOR",
  "DETACH",
  "DETERMINISTIC",
  "DIAGNOSTICS",
  "DISABLE",
  "DISALLOW",
  "DISCONNECT",
  "DISTINCT",
  "DO",
  "DOCUMENT",
  "DROP",
  "DYNAMIC",
  "EACH",
  "ELSE",
  "ELSEIF",
  "EMPTY",
  "ENABLE",
  "ENCODING",
  "ENCRYPTION",
  "END",
  "END-EXEC",
  "ENDING",
  "ENFORCED",
  "ERROR",
  "ESCAPE",
  "EVERY",
  "EXCEPT",
  "EXCEPTION",
  "EXCLUDING",
  "EXCLUSIVE",
  "EXECUTE",
  "EXISTS",
  "EXIT",
  "EXTEND",
  "EXTERNAL",
  "EXTRACT",
  "FALSE",
  "FENCED",
  "FETCH",
  "FIELDPROC",
  "FILE",
  "FINAL",
  "FIRST_VALUE",
  "FOR",
  "FOREIGN",
  "FORMAT",
  "FREE",
  "FREEPAGE",
  "FROM",
  "FULL",
  "FUNCTION",
  "GBPCACHE",
  "GENERAL",
  "GENERATED",
  "GET",
  "GLOBAL",
  "GO",
  "GOTO",
  "GRANT",
  "GROUP",
  "HANDLER",
  "HASH",
  "HASH_ROW",
  "HASHED_VALUE",
  "HAVING",
  "HINT",
  "HOLD",
  "HOUR",
  "HOURS",
  // 'ID', Not actually a reserved keyword
  "IDENTITY",
  "IF",
  "IGNORE",
  "IMMEDIATE",
  "IMPLICITLY",
  "IN",
  "INCLUDE",
  "INCLUDING",
  "INCLUSIVE",
  "INCREMENT",
  "INDEX",
  "INDEXBP",
  "INDICATOR",
  "INF",
  "INFINITY",
  "INHERIT",
  "INLINE",
  "INNER",
  "INOUT",
  "INSENSITIVE",
  "INSERT",
  "INSERTING",
  "INTEGRITY",
  "INTERPRET",
  "INTERSECT",
  "INTO",
  "IS",
  "ISNULL",
  "ISOLATION",
  "ITERATE",
  "JAVA",
  "JOIN",
  "JSON",
  "JSON_ARRAY",
  "JSON_ARRAYAGG",
  "JSON_EXISTS",
  "JSON_OBJECT",
  "JSON_OBJECTAGG",
  "JSON_QUERY",
  "JSON_TABLE",
  "JSON_VALUE",
  "KEEP",
  "KEY",
  "KEYS",
  "LABEL",
  "LAG",
  "LANGUAGE",
  "LAST_VALUE",
  "LATERAL",
  "LEAD",
  "LEAVE",
  "LEFT",
  "LEVEL2",
  "LIKE",
  "LIMIT",
  "LINKTYPE",
  "LISTAGG",
  "LOCAL",
  "LOCALDATE",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCATION",
  "LOCATOR",
  "LOCK",
  "LOCKSIZE",
  "LOG",
  "LOGGED",
  "LOOP",
  "MAINTAINED",
  "MASK",
  "MATCHED",
  "MATERIALIZED",
  "MAXVALUE",
  "MERGE",
  "MICROSECOND",
  "MICROSECONDS",
  "MINPCTUSED",
  "MINUTE",
  "MINUTES",
  "MINVALUE",
  "MIRROR",
  "MIXED",
  "MODE",
  "MODIFIES",
  "MONTH",
  "MONTHS",
  "NAMESPACE",
  "NAN",
  "NATIONAL",
  "NCHAR",
  "NCLOB",
  "NESTED",
  "NEW",
  "NEW_TABLE",
  "NEXTVAL",
  "NO",
  "NOCACHE",
  "NOCYCLE",
  "NODENAME",
  "NODENUMBER",
  "NOMAXVALUE",
  "NOMINVALUE",
  "NONE",
  "NOORDER",
  "NORMALIZED",
  "NOT",
  "NOTNULL",
  "NTH_VALUE",
  "NTILE",
  "NULL",
  "NULLS",
  "NVARCHAR",
  "OBID",
  "OBJECT",
  "OF",
  "OFF",
  "OFFSET",
  "OLD",
  "OLD_TABLE",
  "OMIT",
  "ON",
  "ONLY",
  "OPEN",
  "OPTIMIZE",
  "OPTION",
  "OR",
  "ORDER",
  "ORDINALITY",
  "ORGANIZE",
  "OUT",
  "OUTER",
  "OVER",
  "OVERLAY",
  "OVERRIDING",
  "PACKAGE",
  "PADDED",
  "PAGE",
  "PAGESIZE",
  "PARAMETER",
  "PART",
  "PARTITION",
  "PARTITIONED",
  "PARTITIONING",
  "PARTITIONS",
  "PASSING",
  "PASSWORD",
  "PATH",
  "PCTFREE",
  "PERCENT_RANK",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PERIOD",
  "PERMISSION",
  "PIECESIZE",
  "PIPE",
  "PLAN",
  "POSITION",
  "PREPARE",
  "PREVVAL",
  "PRIMARY",
  "PRIOR",
  "PRIQTY",
  "PRIVILEGES",
  "PROCEDURE",
  "PROGRAM",
  "PROGRAMID",
  "QUERY",
  "RANGE",
  "RANK",
  "RATIO_TO_REPORT",
  "RCDFMT",
  "READ",
  "READS",
  "RECOVERY",
  "REFERENCES",
  "REFERENCING",
  "REFRESH",
  "REGEXP_LIKE",
  "RELEASE",
  "RENAME",
  "REPEAT",
  "RESET",
  "RESIGNAL",
  "RESTART",
  "RESULT",
  "RESULT_SET_LOCATOR",
  "RETURN",
  "RETURNING",
  "RETURNS",
  "REVOKE",
  "RID",
  "RIGHT",
  "ROLLBACK",
  "ROLLUP",
  "ROUTINE",
  "ROW",
  "ROW_NUMBER",
  "ROWNUMBER",
  "ROWS",
  "RRN",
  "RUN",
  "SAVEPOINT",
  "SBCS",
  "SCALAR",
  "SCHEMA",
  "SCRATCHPAD",
  "SCROLL",
  "SEARCH",
  "SECOND",
  "SECONDS",
  "SECQTY",
  "SECURED",
  "SELECT",
  "SENSITIVE",
  "SEQUENCE",
  "SESSION",
  "SESSION_USER",
  "SET",
  "SIGNAL",
  "SIMPLE",
  "SKIP",
  "SNAN",
  "SOME",
  "SOURCE",
  "SPECIFIC",
  "SQL",
  "SQLID",
  "SQLIND_DEFAULT",
  "SQLIND_UNASSIGNED",
  "STACKED",
  "START",
  "STARTING",
  "STATEMENT",
  "STATIC",
  "STOGROUP",
  "SUBSTRING",
  "SUMMARY",
  "SYNONYM",
  "SYSTEM_TIME",
  "SYSTEM_USER",
  "TABLE",
  "TABLESPACE",
  "TABLESPACES",
  "TAG",
  "THEN",
  "THREADSAFE",
  "TO",
  "TRANSACTION",
  "TRANSFER",
  "TRIGGER",
  "TRIM",
  "TRIM_ARRAY",
  "TRUE",
  "TRUNCATE",
  "TRY_CAST",
  "TYPE",
  "UNDO",
  "UNION",
  "UNIQUE",
  "UNIT",
  "UNKNOWN",
  "UNNEST",
  "UNTIL",
  "UPDATE",
  "UPDATING",
  "URI",
  "USAGE",
  "USE",
  "USER",
  "USERID",
  "USING",
  "VALUE",
  "VALUES",
  "VARIABLE",
  "VARIANT",
  "VCAT",
  "VERSION",
  "VERSIONING",
  "VIEW",
  "VOLATILE",
  "WAIT",
  "WHEN",
  "WHENEVER",
  "WHERE",
  "WHILE",
  "WITH",
  "WITHIN",
  "WITHOUT",
  "WRAPPED",
  "WRAPPER",
  "WRITE",
  "WRKSTNNAME",
  "XMLAGG",
  "XMLATTRIBUTES",
  "XMLCAST",
  "XMLCOMMENT",
  "XMLCONCAT",
  "XMLDOCUMENT",
  "XMLELEMENT",
  "XMLFOREST",
  "XMLGROUP",
  "XMLNAMESPACES",
  "XMLPARSE",
  "XMLPI",
  "XMLROW",
  "XMLSERIALIZE",
  "XMLTABLE",
  "XMLTEXT",
  "XMLVALIDATE",
  "XSLTRANSFORM",
  "XSROBJECT",
  "YEAR",
  "YEARS",
  "YES",
  "ZONE"
];
var dataTypes4 = [
  // https://www.ibm.com/docs/en/i/7.2?topic=iaodsd-odbc-data-types-how-they-correspond-db2-i-database-types
  "ARRAY",
  "BIGINT",
  "BINARY",
  "BIT",
  "BLOB",
  "BOOLEAN",
  "CCSID",
  "CHAR",
  "CHARACTER",
  "CLOB",
  "DATA",
  "DATALINK",
  "DATE",
  "DBCLOB",
  "DECFLOAT",
  "DECIMAL",
  "DEC",
  "DOUBLE",
  "DOUBLE PRECISION",
  "FLOAT",
  "GRAPHIC",
  "INT",
  "INTEGER",
  "LONG",
  "NUMERIC",
  "REAL",
  "ROWID",
  "SMALLINT",
  "TIME",
  "TIMESTAMP",
  "VARBINARY",
  "VARCHAR",
  "VARGRAPHIC",
  "XML"
];

// node_modules/sql-formatter/dist/esm/languages/db2i/db2i.formatter.js
var reservedSelect4 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses4 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "INTO",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER [SIBLINGS] BY [INPUT SEQUENCE]",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  "FOR UPDATE [OF]",
  "FOR READ ONLY",
  "OPTIMIZE FOR",
  // Data modification
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  "DELETE",
  "INSERT",
  // Data definition - table
  "FOR SYSTEM NAME"
]);
var standardOnelineClauses4 = expandPhrases(["CREATE [OR REPLACE] TABLE"]);
var tabularOnelineClauses4 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [RECURSIVE] VIEW",
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  "WITH {NC | RR | RS | CS | UR}",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE",
  // alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "ALTER [COLUMN]",
  "DROP [COLUMN]",
  "SET DATA TYPE",
  "SET {GENERATED ALWAYS | GENERATED BY DEFAULT}",
  "SET NOT NULL",
  "SET {NOT HIDDEN | IMPLICITLY HIDDEN}",
  "SET FIELDPROC",
  "DROP {DEFAULT | NOT NULL | GENERATED | IDENTITY | ROW CHANGE TIMESTAMP | FIELDPROC}",
  // - truncate:
  "TRUNCATE [TABLE]",
  // other
  "SET [CURRENT] SCHEMA",
  "SET CURRENT_SCHEMA",
  // https://www.ibm.com/docs/en/i/7.5?topic=reference-statements
  "ALLOCATE CURSOR",
  "ALLOCATE [SQL] DESCRIPTOR [LOCAL | GLOBAL] SQL",
  "ALTER [SPECIFIC] {FUNCTION | PROCEDURE}",
  "ALTER {MASK | PERMISSION | SEQUENCE | TRIGGER}",
  "ASSOCIATE [RESULT SET] {LOCATOR | LOCATORS}",
  "BEGIN DECLARE SECTION",
  "CALL",
  "CLOSE",
  "COMMENT ON {ALIAS | COLUMN | CONSTRAINT | INDEX | MASK | PACKAGE | PARAMETER | PERMISSION | SEQUENCE | TABLE | TRIGGER | VARIABLE | XSROBJECT}",
  "COMMENT ON [SPECIFIC] {FUNCTION | PROCEDURE | ROUTINE}",
  "COMMENT ON PARAMETER SPECIFIC {FUNCTION | PROCEDURE | ROUTINE}",
  "COMMENT ON [TABLE FUNCTION] RETURN COLUMN",
  "COMMENT ON [TABLE FUNCTION] RETURN COLUMN SPECIFIC [PROCEDURE | ROUTINE]",
  "COMMIT [WORK] [HOLD]",
  "CONNECT [TO | RESET] USER",
  "CREATE [OR REPLACE] {ALIAS | FUNCTION | MASK | PERMISSION | PROCEDURE | SEQUENCE | TRIGGER | VARIABLE}",
  "CREATE [ENCODED VECTOR] INDEX",
  "CREATE UNIQUE [WHERE NOT NULL] INDEX",
  "CREATE SCHEMA",
  "CREATE TYPE",
  "DEALLOCATE [SQL] DESCRIPTOR [LOCAL | GLOBAL]",
  "DECLARE CURSOR",
  "DECLARE GLOBAL TEMPORARY TABLE",
  "DECLARE",
  "DESCRIBE CURSOR",
  "DESCRIBE INPUT",
  "DESCRIBE [OUTPUT]",
  "DESCRIBE {PROCEDURE | ROUTINE}",
  "DESCRIBE TABLE",
  "DISCONNECT ALL [SQL]",
  "DISCONNECT [CURRENT]",
  "DROP {ALIAS | INDEX | MASK | PACKAGE | PERMISSION | SCHEMA | SEQUENCE | TABLE | TYPE | VARIABLE | XSROBJECT} [IF EXISTS]",
  "DROP [SPECIFIC] {FUNCTION | PROCEDURE | ROUTINE} [IF EXISTS]",
  "END DECLARE SECTION",
  "EXECUTE [IMMEDIATE]",
  // 'FETCH {NEXT | PRIOR | FIRST | LAST | BEFORE | AFTER | CURRENT} [FROM]',
  "FREE LOCATOR",
  "GET [SQL] DESCRIPTOR [LOCAL | GLOBAL]",
  "GET [CURRENT | STACKED] DIAGNOSTICS",
  "GRANT {ALL [PRIVILEGES] | ALTER | EXECUTE} ON {FUNCTION | PROCEDURE | ROUTINE | PACKAGE | SCHEMA | SEQUENCE | TABLE | TYPE | VARIABLE | XSROBJECT}",
  "HOLD LOCATOR",
  "INCLUDE",
  "LABEL ON {ALIAS | COLUMN | CONSTRAINT | INDEX | MASK | PACKAGE | PERMISSION | SEQUENCE | TABLE | TRIGGER | VARIABLE | XSROBJECT}",
  "LABEL ON [SPECIFIC] {FUNCTION | PROCEDURE | ROUTINE}",
  "LOCK TABLE",
  "OPEN",
  "PREPARE",
  "REFRESH TABLE",
  "RELEASE",
  "RELEASE [TO] SAVEPOINT",
  "RENAME [TABLE | INDEX] TO",
  "REVOKE {ALL [PRIVILEGES] | ALTER | EXECUTE} ON {FUNCTION | PROCEDURE | ROUTINE | PACKAGE | SCHEMA | SEQUENCE | TABLE | TYPE | VARIABLE | XSROBJECT}",
  "ROLLBACK [WORK] [HOLD | TO SAVEPOINT]",
  "SAVEPOINT",
  "SET CONNECTION",
  "SET CURRENT {DEBUG MODE | DECFLOAT ROUNDING MODE | DEGREE | IMPLICIT XMLPARSE OPTION | TEMPORAL SYSTEM_TIME}",
  "SET [SQL] DESCRIPTOR [LOCAL | GLOBAL]",
  "SET ENCRYPTION PASSWORD",
  "SET OPTION",
  "SET {[CURRENT [FUNCTION]] PATH | CURRENT_PATH}",
  "SET RESULT SETS [WITH RETURN [TO CALLER | TO CLIENT]]",
  "SET SESSION AUTHORIZATION",
  "SET SESSION_USER",
  "SET TRANSACTION",
  "SIGNAL SQLSTATE [VALUE]",
  "TAG",
  "TRANSFER OWNERSHIP OF",
  "WHENEVER {NOT FOUND | SQLERROR | SQLWARNING}"
]);
var reservedSetOperations4 = expandPhrases(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"]);
var reservedJoins4 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "[LEFT | RIGHT] EXCEPTION JOIN",
  "{INNER | CROSS} JOIN"
]);
var reservedKeywordPhrases4 = expandPhrases([
  "ON DELETE",
  "ON UPDATE",
  "SET NULL",
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases3 = expandPhrases([]);
var db2i = {
  name: "db2i",
  tokenizerOptions: {
    reservedSelect: reservedSelect4,
    reservedClauses: [...reservedClauses4, ...standardOnelineClauses4, ...tabularOnelineClauses4],
    reservedSetOperations: reservedSetOperations4,
    reservedJoins: reservedJoins4,
    reservedKeywordPhrases: reservedKeywordPhrases4,
    reservedDataTypePhrases: reservedDataTypePhrases3,
    reservedKeywords: keywords4,
    reservedDataTypes: dataTypes4,
    reservedFunctionNames: functions4,
    nestedBlockComments: true,
    extraParens: ["[]"],
    stringTypes: [
      { quote: "''-qq", prefixes: ["G", "N"] },
      { quote: "''-raw", prefixes: ["X", "BX", "GX", "UX"], requirePrefix: true }
    ],
    identTypes: [`""-qq`],
    identChars: { first: "@#$", rest: "@#$" },
    paramTypes: { positional: true, named: [":"] },
    paramChars: { first: "@#$", rest: "@#$" },
    operators: ["**", "\xAC=", "\xAC>", "\xAC<", "!>", "!<", "||", "=>"]
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses4, ...tabularOnelineClauses4],
    tabularOnelineClauses: tabularOnelineClauses4
  }
};

// node_modules/sql-formatter/dist/esm/languages/duckdb/duckdb.functions.js
var functions5 = [
  // Functions from DuckDB (excluding those that start with an underscore):
  // SELECT DISTINCT upper(function_name) AS function_name
  // FROM duckdb_functions()
  // WHERE function_name SIMILAR TO '^[a-z].*'
  // ORDER BY function_name
  "ABS",
  "ACOS",
  "ADD",
  "ADD_PARQUET_KEY",
  "AGE",
  "AGGREGATE",
  "ALIAS",
  "ALL_PROFILING_OUTPUT",
  "ANY_VALUE",
  "APPLY",
  "APPROX_COUNT_DISTINCT",
  "APPROX_QUANTILE",
  "ARBITRARY",
  "ARGMAX",
  "ARGMIN",
  "ARG_MAX",
  "ARG_MAX_NULL",
  "ARG_MIN",
  "ARG_MIN_NULL",
  "ARRAY_AGG",
  "ARRAY_AGGR",
  "ARRAY_AGGREGATE",
  "ARRAY_APPEND",
  "ARRAY_APPLY",
  "ARRAY_CAT",
  "ARRAY_CONCAT",
  "ARRAY_CONTAINS",
  "ARRAY_COSINE_SIMILARITY",
  "ARRAY_CROSS_PRODUCT",
  "ARRAY_DISTANCE",
  "ARRAY_DISTINCT",
  "ARRAY_DOT_PRODUCT",
  "ARRAY_EXTRACT",
  "ARRAY_FILTER",
  "ARRAY_GRADE_UP",
  "ARRAY_HAS",
  "ARRAY_HAS_ALL",
  "ARRAY_HAS_ANY",
  "ARRAY_INDEXOF",
  "ARRAY_INNER_PRODUCT",
  "ARRAY_INTERSECT",
  "ARRAY_LENGTH",
  "ARRAY_POP_BACK",
  "ARRAY_POP_FRONT",
  "ARRAY_POSITION",
  "ARRAY_PREPEND",
  "ARRAY_PUSH_BACK",
  "ARRAY_PUSH_FRONT",
  "ARRAY_REDUCE",
  "ARRAY_RESIZE",
  "ARRAY_REVERSE",
  "ARRAY_REVERSE_SORT",
  "ARRAY_SELECT",
  "ARRAY_SLICE",
  "ARRAY_SORT",
  "ARRAY_TO_JSON",
  "ARRAY_TO_STRING",
  "ARRAY_TRANSFORM",
  "ARRAY_UNIQUE",
  "ARRAY_VALUE",
  "ARRAY_WHERE",
  "ARRAY_ZIP",
  "ARROW_SCAN",
  "ARROW_SCAN_DUMB",
  "ASCII",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AVG",
  "BASE64",
  "BIN",
  "BITSTRING",
  "BITSTRING_AGG",
  "BIT_AND",
  "BIT_COUNT",
  "BIT_LENGTH",
  "BIT_OR",
  "BIT_POSITION",
  "BIT_XOR",
  "BOOL_AND",
  "BOOL_OR",
  "CARDINALITY",
  "CBRT",
  "CEIL",
  "CEILING",
  "CENTURY",
  "CHECKPOINT",
  "CHR",
  "COLLATIONS",
  "COL_DESCRIPTION",
  "COMBINE",
  "CONCAT",
  "CONCAT_WS",
  "CONSTANT_OR_NULL",
  "CONTAINS",
  "COPY_DATABASE",
  "CORR",
  "COS",
  "COT",
  "COUNT",
  "COUNT_IF",
  "COUNT_STAR",
  "COVAR_POP",
  "COVAR_SAMP",
  "CREATE_SORT_KEY",
  "CURRENT_CATALOG",
  "CURRENT_DATABASE",
  "CURRENT_DATE",
  "CURRENT_LOCALTIME",
  "CURRENT_LOCALTIMESTAMP",
  "CURRENT_QUERY",
  "CURRENT_ROLE",
  "CURRENT_SCHEMA",
  "CURRENT_SCHEMAS",
  "CURRENT_SETTING",
  "CURRENT_USER",
  "CURRVAL",
  "DAMERAU_LEVENSHTEIN",
  "DATABASE_LIST",
  "DATABASE_SIZE",
  "DATEDIFF",
  "DATEPART",
  "DATESUB",
  "DATETRUNC",
  "DATE_ADD",
  "DATE_DIFF",
  "DATE_PART",
  "DATE_SUB",
  "DATE_TRUNC",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DECADE",
  "DECODE",
  "DEGREES",
  "DISABLE_CHECKPOINT_ON_SHUTDOWN",
  "DISABLE_OBJECT_CACHE",
  "DISABLE_OPTIMIZER",
  "DISABLE_PRINT_PROGRESS_BAR",
  "DISABLE_PROFILE",
  "DISABLE_PROFILING",
  "DISABLE_PROGRESS_BAR",
  "DISABLE_VERIFICATION",
  "DISABLE_VERIFY_EXTERNAL",
  "DISABLE_VERIFY_FETCH_ROW",
  "DISABLE_VERIFY_PARALLELISM",
  "DISABLE_VERIFY_SERIALIZER",
  "DIVIDE",
  "DUCKDB_COLUMNS",
  "DUCKDB_CONSTRAINTS",
  "DUCKDB_DATABASES",
  "DUCKDB_DEPENDENCIES",
  "DUCKDB_EXTENSIONS",
  "DUCKDB_FUNCTIONS",
  "DUCKDB_INDEXES",
  "DUCKDB_KEYWORDS",
  "DUCKDB_MEMORY",
  "DUCKDB_OPTIMIZERS",
  "DUCKDB_SCHEMAS",
  "DUCKDB_SECRETS",
  "DUCKDB_SEQUENCES",
  "DUCKDB_SETTINGS",
  "DUCKDB_TABLES",
  "DUCKDB_TEMPORARY_FILES",
  "DUCKDB_TYPES",
  "DUCKDB_VIEWS",
  "EDIT",
  "EDITDIST3",
  "ELEMENT_AT",
  "ENABLE_CHECKPOINT_ON_SHUTDOWN",
  "ENABLE_OBJECT_CACHE",
  "ENABLE_OPTIMIZER",
  "ENABLE_PRINT_PROGRESS_BAR",
  "ENABLE_PROFILE",
  "ENABLE_PROFILING",
  "ENABLE_PROGRESS_BAR",
  "ENABLE_VERIFICATION",
  "ENCODE",
  "ENDS_WITH",
  "ENTROPY",
  "ENUM_CODE",
  "ENUM_FIRST",
  "ENUM_LAST",
  "ENUM_RANGE",
  "ENUM_RANGE_BOUNDARY",
  "EPOCH",
  "EPOCH_MS",
  "EPOCH_NS",
  "EPOCH_US",
  "ERA",
  "ERROR",
  "EVEN",
  "EXP",
  "FACTORIAL",
  "FAVG",
  "FDIV",
  "FILTER",
  "FINALIZE",
  "FIRST",
  "FLATTEN",
  "FLOOR",
  "FMOD",
  "FORCE_CHECKPOINT",
  "FORMAT",
  "FORMATREADABLEDECIMALSIZE",
  "FORMATREADABLESIZE",
  "FORMAT_BYTES",
  "FORMAT_PG_TYPE",
  "FORMAT_TYPE",
  "FROM_BASE64",
  "FROM_BINARY",
  "FROM_HEX",
  "FROM_JSON",
  "FROM_JSON_STRICT",
  "FSUM",
  "FUNCTIONS",
  "GAMMA",
  "GCD",
  "GENERATE_SERIES",
  "GENERATE_SUBSCRIPTS",
  "GEN_RANDOM_UUID",
  "GEOMEAN",
  "GEOMETRIC_MEAN",
  "GETENV",
  "GET_BIT",
  "GET_BLOCK_SIZE",
  "GET_CURRENT_TIME",
  "GET_CURRENT_TIMESTAMP",
  "GLOB",
  "GRADE_UP",
  "GREATEST",
  "GREATEST_COMMON_DIVISOR",
  "GROUP_CONCAT",
  "HAMMING",
  "HASH",
  "HAS_ANY_COLUMN_PRIVILEGE",
  "HAS_COLUMN_PRIVILEGE",
  "HAS_DATABASE_PRIVILEGE",
  "HAS_FOREIGN_DATA_WRAPPER_PRIVILEGE",
  "HAS_FUNCTION_PRIVILEGE",
  "HAS_LANGUAGE_PRIVILEGE",
  "HAS_SCHEMA_PRIVILEGE",
  "HAS_SEQUENCE_PRIVILEGE",
  "HAS_SERVER_PRIVILEGE",
  "HAS_TABLESPACE_PRIVILEGE",
  "HAS_TABLE_PRIVILEGE",
  "HEX",
  "HISTOGRAM",
  "HOUR",
  "ICU_CALENDAR_NAMES",
  "ICU_SORT_KEY",
  "ILIKE_ESCAPE",
  "IMPORT_DATABASE",
  "INDEX_SCAN",
  "INET_CLIENT_ADDR",
  "INET_CLIENT_PORT",
  "INET_SERVER_ADDR",
  "INET_SERVER_PORT",
  "INSTR",
  "IN_SEARCH_PATH",
  "ISFINITE",
  "ISINF",
  "ISNAN",
  "ISODOW",
  "ISOYEAR",
  "JACCARD",
  "JARO_SIMILARITY",
  "JARO_WINKLER_SIMILARITY",
  // 'JSON',
  "JSON_ARRAY",
  "JSON_ARRAY_LENGTH",
  "JSON_CONTAINS",
  "JSON_DESERIALIZE_SQL",
  "JSON_EXECUTE_SERIALIZED_SQL",
  "JSON_EXTRACT",
  "JSON_EXTRACT_PATH",
  "JSON_EXTRACT_PATH_TEXT",
  "JSON_EXTRACT_STRING",
  "JSON_GROUP_ARRAY",
  "JSON_GROUP_OBJECT",
  "JSON_GROUP_STRUCTURE",
  "JSON_KEYS",
  "JSON_MERGE_PATCH",
  "JSON_OBJECT",
  "JSON_QUOTE",
  "JSON_SERIALIZE_PLAN",
  "JSON_SERIALIZE_SQL",
  "JSON_STRUCTURE",
  "JSON_TRANSFORM",
  "JSON_TRANSFORM_STRICT",
  "JSON_TYPE",
  "JSON_VALID",
  "JULIAN",
  "KAHAN_SUM",
  "KURTOSIS",
  "KURTOSIS_POP",
  "LAST",
  "LAST_DAY",
  "LCASE",
  "LCM",
  "LEAST",
  "LEAST_COMMON_MULTIPLE",
  "LEFT",
  "LEFT_GRAPHEME",
  "LEN",
  "LENGTH",
  "LENGTH_GRAPHEME",
  "LEVENSHTEIN",
  "LGAMMA",
  "LIKE_ESCAPE",
  "LIST",
  "LISTAGG",
  "LIST_AGGR",
  "LIST_AGGREGATE",
  "LIST_ANY_VALUE",
  "LIST_APPEND",
  "LIST_APPLY",
  "LIST_APPROX_COUNT_DISTINCT",
  "LIST_AVG",
  "LIST_BIT_AND",
  "LIST_BIT_OR",
  "LIST_BIT_XOR",
  "LIST_BOOL_AND",
  "LIST_BOOL_OR",
  "LIST_CAT",
  "LIST_CONCAT",
  "LIST_CONTAINS",
  "LIST_COSINE_SIMILARITY",
  "LIST_COUNT",
  "LIST_DISTANCE",
  "LIST_DISTINCT",
  "LIST_DOT_PRODUCT",
  "LIST_ELEMENT",
  "LIST_ENTROPY",
  "LIST_EXTRACT",
  "LIST_FILTER",
  "LIST_FIRST",
  "LIST_GRADE_UP",
  "LIST_HAS",
  "LIST_HAS_ALL",
  "LIST_HAS_ANY",
  "LIST_HISTOGRAM",
  "LIST_INDEXOF",
  "LIST_INNER_PRODUCT",
  "LIST_INTERSECT",
  "LIST_KURTOSIS",
  "LIST_KURTOSIS_POP",
  "LIST_LAST",
  "LIST_MAD",
  "LIST_MAX",
  "LIST_MEDIAN",
  "LIST_MIN",
  "LIST_MODE",
  "LIST_PACK",
  "LIST_POSITION",
  "LIST_PREPEND",
  "LIST_PRODUCT",
  "LIST_REDUCE",
  "LIST_RESIZE",
  "LIST_REVERSE",
  "LIST_REVERSE_SORT",
  "LIST_SELECT",
  "LIST_SEM",
  "LIST_SKEWNESS",
  "LIST_SLICE",
  "LIST_SORT",
  "LIST_STDDEV_POP",
  "LIST_STDDEV_SAMP",
  "LIST_STRING_AGG",
  "LIST_SUM",
  "LIST_TRANSFORM",
  "LIST_UNIQUE",
  "LIST_VALUE",
  "LIST_VAR_POP",
  "LIST_VAR_SAMP",
  "LIST_WHERE",
  "LIST_ZIP",
  "LN",
  "LOG",
  "LOG10",
  "LOG2",
  "LOWER",
  "LPAD",
  "LSMODE",
  "LTRIM",
  "MAD",
  "MAKE_DATE",
  "MAKE_TIME",
  "MAKE_TIMESTAMP",
  "MAKE_TIMESTAMPTZ",
  "MAP",
  "MAP_CONCAT",
  "MAP_ENTRIES",
  "MAP_EXTRACT",
  "MAP_FROM_ENTRIES",
  "MAP_KEYS",
  "MAP_VALUES",
  "MAX",
  "MAX_BY",
  "MD5",
  "MD5_NUMBER",
  "MD5_NUMBER_LOWER",
  "MD5_NUMBER_UPPER",
  "MEAN",
  "MEDIAN",
  "METADATA_INFO",
  "MICROSECOND",
  "MILLENNIUM",
  "MILLISECOND",
  "MIN",
  "MINUTE",
  "MIN_BY",
  "MISMATCHES",
  "MOD",
  "MODE",
  "MONTH",
  "MONTHNAME",
  "MULTIPLY",
  "NEXTAFTER",
  "NEXTVAL",
  "NFC_NORMALIZE",
  "NOT_ILIKE_ESCAPE",
  "NOT_LIKE_ESCAPE",
  "NOW",
  "NULLIF",
  "OBJ_DESCRIPTION",
  "OCTET_LENGTH",
  "ORD",
  "PARQUET_FILE_METADATA",
  "PARQUET_KV_METADATA",
  "PARQUET_METADATA",
  "PARQUET_SCAN",
  "PARQUET_SCHEMA",
  "PARSE_DIRNAME",
  "PARSE_DIRPATH",
  "PARSE_FILENAME",
  "PARSE_PATH",
  "PG_COLLATION_IS_VISIBLE",
  "PG_CONF_LOAD_TIME",
  "PG_CONVERSION_IS_VISIBLE",
  "PG_FUNCTION_IS_VISIBLE",
  "PG_GET_CONSTRAINTDEF",
  "PG_GET_EXPR",
  "PG_GET_VIEWDEF",
  "PG_HAS_ROLE",
  "PG_IS_OTHER_TEMP_SCHEMA",
  "PG_MY_TEMP_SCHEMA",
  "PG_OPCLASS_IS_VISIBLE",
  "PG_OPERATOR_IS_VISIBLE",
  "PG_OPFAMILY_IS_VISIBLE",
  "PG_POSTMASTER_START_TIME",
  "PG_SIZE_PRETTY",
  "PG_TABLE_IS_VISIBLE",
  "PG_TIMEZONE_NAMES",
  "PG_TS_CONFIG_IS_VISIBLE",
  "PG_TS_DICT_IS_VISIBLE",
  "PG_TS_PARSER_IS_VISIBLE",
  "PG_TS_TEMPLATE_IS_VISIBLE",
  "PG_TYPEOF",
  "PG_TYPE_IS_VISIBLE",
  "PI",
  "PLATFORM",
  "POSITION",
  "POW",
  "POWER",
  "PRAGMA_COLLATIONS",
  "PRAGMA_DATABASE_SIZE",
  "PRAGMA_METADATA_INFO",
  "PRAGMA_PLATFORM",
  "PRAGMA_SHOW",
  "PRAGMA_STORAGE_INFO",
  "PRAGMA_TABLE_INFO",
  "PRAGMA_USER_AGENT",
  "PRAGMA_VERSION",
  "PREFIX",
  "PRINTF",
  "PRODUCT",
  "QUANTILE",
  "QUANTILE_CONT",
  "QUANTILE_DISC",
  "QUARTER",
  "RADIANS",
  "RANDOM",
  "RANGE",
  "READFILE",
  "READ_BLOB",
  "READ_CSV",
  "READ_CSV_AUTO",
  "READ_JSON",
  "READ_JSON_AUTO",
  "READ_JSON_OBJECTS",
  "READ_JSON_OBJECTS_AUTO",
  "READ_NDJSON",
  "READ_NDJSON_AUTO",
  "READ_NDJSON_OBJECTS",
  "READ_PARQUET",
  "READ_TEXT",
  "REDUCE",
  "REGEXP_ESCAPE",
  "REGEXP_EXTRACT",
  "REGEXP_EXTRACT_ALL",
  "REGEXP_FULL_MATCH",
  "REGEXP_MATCHES",
  "REGEXP_REPLACE",
  "REGEXP_SPLIT_TO_ARRAY",
  "REGEXP_SPLIT_TO_TABLE",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  "REPEAT",
  "REPEAT_ROW",
  "REPLACE",
  "RESERVOIR_QUANTILE",
  "REVERSE",
  "RIGHT",
  "RIGHT_GRAPHEME",
  "ROUND",
  "ROUNDBANKERS",
  "ROUND_EVEN",
  "ROW",
  "ROW_TO_JSON",
  "RPAD",
  "RTRIM",
  "SECOND",
  "SEM",
  "SEQ_SCAN",
  "SESSION_USER",
  "SETSEED",
  "SET_BIT",
  "SHA256",
  "SHA3",
  "SHELL_ADD_SCHEMA",
  "SHELL_ESCAPE_CRNL",
  "SHELL_IDQUOTE",
  "SHELL_MODULE_SCHEMA",
  "SHELL_PUTSNL",
  "SHOBJ_DESCRIPTION",
  "SHOW",
  "SHOW_DATABASES",
  "SHOW_TABLES",
  "SHOW_TABLES_EXPANDED",
  "SIGN",
  "SIGNBIT",
  "SIN",
  "SKEWNESS",
  "SNIFF_CSV",
  "SPLIT",
  "SPLIT_PART",
  "SQL_AUTO_COMPLETE",
  "SQRT",
  "STARTS_WITH",
  "STATS",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STORAGE_INFO",
  "STRFTIME",
  "STRING_AGG",
  "STRING_SPLIT",
  "STRING_SPLIT_REGEX",
  "STRING_TO_ARRAY",
  "STRIP_ACCENTS",
  "STRLEN",
  "STRPOS",
  "STRPTIME",
  "STRUCT_EXTRACT",
  "STRUCT_INSERT",
  "STRUCT_PACK",
  "STR_SPLIT",
  "STR_SPLIT_REGEX",
  "SUBSTR",
  "SUBSTRING",
  "SUBSTRING_GRAPHEME",
  "SUBTRACT",
  "SUFFIX",
  "SUM",
  "SUMKAHAN",
  "SUMMARY",
  "SUM_NO_OVERFLOW",
  "TABLE_INFO",
  "TAN",
  "TEST_ALL_TYPES",
  "TEST_VECTOR_TYPES",
  "TIMEZONE",
  "TIMEZONE_HOUR",
  "TIMEZONE_MINUTE",
  "TIME_BUCKET",
  "TODAY",
  "TO_BASE",
  "TO_BASE64",
  "TO_BINARY",
  "TO_CENTURIES",
  "TO_DAYS",
  "TO_DECADES",
  "TO_HEX",
  "TO_HOURS",
  "TO_JSON",
  "TO_MICROSECONDS",
  "TO_MILLENNIA",
  "TO_MILLISECONDS",
  "TO_MINUTES",
  "TO_MONTHS",
  "TO_SECONDS",
  "TO_TIMESTAMP",
  "TO_WEEKS",
  "TO_YEARS",
  "TRANSACTION_TIMESTAMP",
  "TRANSLATE",
  "TRIM",
  "TRUNC",
  "TRY_STRPTIME",
  "TXID_CURRENT",
  "TYPEOF",
  "UCASE",
  "UNBIN",
  "UNHEX",
  "UNICODE",
  "UNION_EXTRACT",
  "UNION_TAG",
  "UNION_VALUE",
  "UNNEST",
  "UNPIVOT_LIST",
  "UPPER",
  "USER",
  "USER_AGENT",
  "UUID",
  "VARIANCE",
  "VAR_POP",
  "VAR_SAMP",
  "VECTOR_TYPE",
  "VERIFY_EXTERNAL",
  "VERIFY_FETCH_ROW",
  "VERIFY_PARALLELISM",
  "VERIFY_SERIALIZER",
  "VERSION",
  "WEEK",
  "WEEKDAY",
  "WEEKOFYEAR",
  "WHICH_SECRET",
  "WRITEFILE",
  "XOR",
  "YEAR",
  "YEARWEEK",
  // Keywords that also need to be listed as functions
  "CAST",
  "COALESCE",
  // 'NULL', we really prefer treating it as keyword
  "RANK",
  "ROW_NUMBER"
];

// node_modules/sql-formatter/dist/esm/languages/duckdb/duckdb.keywords.js
var keywords5 = [
  // Keywords from DuckDB:
  // SELECT upper(keyword_name)
  // FROM duckdb_keywords()
  // WHERE keyword_category = 'reserved'
  // ORDER BY keyword_name
  "ALL",
  "ANALYSE",
  "ANALYZE",
  "AND",
  "ANY",
  "AS",
  "ASC",
  "ATTACH",
  "ASYMMETRIC",
  "BOTH",
  "CASE",
  "CAST",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "CONSTRAINT",
  "CREATE",
  "DEFAULT",
  "DEFERRABLE",
  "DESC",
  "DESCRIBE",
  "DETACH",
  "DISTINCT",
  "DO",
  "ELSE",
  "END",
  "EXCEPT",
  "FALSE",
  "FETCH",
  "FOR",
  "FOREIGN",
  "FROM",
  "GRANT",
  "GROUP",
  "HAVING",
  "IN",
  "INITIALLY",
  "INTERSECT",
  "INTO",
  "IS",
  "LATERAL",
  "LEADING",
  "LIMIT",
  "NOT",
  "NULL",
  "OFFSET",
  "ON",
  "ONLY",
  "OR",
  "ORDER",
  "PIVOT",
  "PIVOT_LONGER",
  "PIVOT_WIDER",
  "PLACING",
  "PRIMARY",
  "REFERENCES",
  "RETURNING",
  "SELECT",
  "SHOW",
  "SOME",
  "SUMMARIZE",
  "SYMMETRIC",
  "TABLE",
  "THEN",
  "TO",
  "TRAILING",
  "TRUE",
  "UNION",
  "UNIQUE",
  "UNPIVOT",
  "USING",
  "VARIADIC",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH"
];
var dataTypes5 = [
  // Types from DuckDB:
  // SELECT DISTINCT upper(type_name)
  // FROM duckdb_types()
  // ORDER BY type_name
  "ARRAY",
  "BIGINT",
  "BINARY",
  "BIT",
  "BITSTRING",
  "BLOB",
  "BOOL",
  "BOOLEAN",
  "BPCHAR",
  "BYTEA",
  "CHAR",
  "DATE",
  "DATETIME",
  "DEC",
  "DECIMAL",
  "DOUBLE",
  "ENUM",
  "FLOAT",
  "FLOAT4",
  "FLOAT8",
  "GUID",
  "HUGEINT",
  "INET",
  "INT",
  "INT1",
  "INT128",
  "INT16",
  "INT2",
  "INT32",
  "INT4",
  "INT64",
  "INT8",
  "INTEGER",
  "INTEGRAL",
  "INTERVAL",
  "JSON",
  "LIST",
  "LOGICAL",
  "LONG",
  "MAP",
  // 'NULL' is a keyword
  "NUMERIC",
  "NVARCHAR",
  "OID",
  "REAL",
  "ROW",
  "SHORT",
  "SIGNED",
  "SMALLINT",
  "STRING",
  "STRUCT",
  "TEXT",
  "TIME",
  "TIMESTAMP_MS",
  "TIMESTAMP_NS",
  "TIMESTAMP_S",
  "TIMESTAMP_US",
  "TIMESTAMP",
  "TIMESTAMPTZ",
  "TIMETZ",
  "TINYINT",
  "UBIGINT",
  "UHUGEINT",
  "UINT128",
  "UINT16",
  "UINT32",
  "UINT64",
  "UINT8",
  "UINTEGER",
  "UNION",
  "USMALLINT",
  "UTINYINT",
  "UUID",
  "VARBINARY",
  "VARCHAR"
];

// node_modules/sql-formatter/dist/esm/languages/duckdb/duckdb.formatter.js
var reservedSelect5 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses5 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY [ALL]",
  "LIMIT",
  "OFFSET",
  // 'USING' (conflicts with 'USING' in JOIN)
  "USING SAMPLE",
  "QUALIFY",
  // Data manipulation
  // - insert:
  "INSERT [OR REPLACE] INTO",
  "VALUES",
  "DEFAULT VALUES",
  // - update:
  "SET",
  // other:
  "RETURNING"
]);
var standardOnelineClauses5 = expandPhrases([
  "CREATE [OR REPLACE] [TEMPORARY | TEMP] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses5 = expandPhrases([
  // TABLE
  // - update:
  "UPDATE",
  // - insert:
  "ON CONFLICT",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - truncate
  "TRUNCATE",
  // - alter table:
  "ALTER TABLE",
  "ADD [COLUMN] [IF NOT EXISTS]",
  "ADD PRIMARY KEY",
  "DROP [COLUMN] [IF EXISTS]",
  "ALTER [COLUMN]",
  "RENAME [COLUMN]",
  "RENAME TO",
  "SET [DATA] TYPE",
  "{SET | DROP} DEFAULT",
  "{SET | DROP} NOT NULL",
  // MACRO / FUNCTION
  "CREATE [OR REPLACE] [TEMPORARY | TEMP] {MACRO | FUNCTION}",
  "DROP MACRO [TABLE] [IF EXISTS]",
  "DROP FUNCTION [IF EXISTS]",
  // INDEX
  "CREATE [UNIQUE] INDEX [IF NOT EXISTS]",
  "DROP INDEX [IF EXISTS]",
  // SCHEMA
  "CREATE [OR REPLACE] SCHEMA [IF NOT EXISTS]",
  "DROP SCHEMA [IF EXISTS]",
  // SECRET
  "CREATE [OR REPLACE] [PERSISTENT | TEMPORARY] SECRET [IF NOT EXISTS]",
  "DROP [PERSISTENT | TEMPORARY] SECRET [IF EXISTS]",
  // SEQUENCE
  "CREATE [OR REPLACE] [TEMPORARY | TEMP] SEQUENCE",
  "DROP SEQUENCE [IF EXISTS]",
  // VIEW
  "CREATE [OR REPLACE] [TEMPORARY | TEMP] VIEW [IF NOT EXISTS]",
  "DROP VIEW [IF EXISTS]",
  "ALTER VIEW",
  // TYPE
  "CREATE TYPE",
  "DROP TYPE [IF EXISTS]",
  // other
  "ANALYZE",
  "ATTACH [DATABASE] [IF NOT EXISTS]",
  "DETACH [DATABASE] [IF EXISTS]",
  "CALL",
  "[FORCE] CHECKPOINT",
  "COMMENT ON [TABLE | COLUMN | VIEW | INDEX | SEQUENCE | TYPE | MACRO | MACRO TABLE]",
  "COPY [FROM DATABASE]",
  "DESCRIBE",
  "EXPORT DATABASE",
  "IMPORT DATABASE",
  "INSTALL",
  "LOAD",
  "PIVOT",
  "PIVOT_WIDER",
  "UNPIVOT",
  "EXPLAIN [ANALYZE]",
  // plain SET conflicts with SET clause in UPDATE
  "SET {LOCAL | SESSION | GLOBAL}",
  "RESET [LOCAL | SESSION | GLOBAL]",
  "{SET | RESET} VARIABLE",
  "SUMMARIZE",
  "BEGIN TRANSACTION",
  "ROLLBACK",
  "COMMIT",
  "ABORT",
  "USE",
  "VACUUM [ANALYZE]",
  // prepared statements
  "PREPARE",
  "EXECUTE",
  "DEALLOCATE [PREPARE]"
]);
var reservedSetOperations5 = expandPhrases([
  "UNION [ALL | BY NAME]",
  "EXCEPT [ALL]",
  "INTERSECT [ALL]"
]);
var reservedJoins5 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "{NATURAL | ASOF} [INNER] JOIN",
  "{NATURAL | ASOF} {LEFT | RIGHT | FULL} [OUTER] JOIN",
  "POSITIONAL JOIN",
  "ANTI JOIN",
  "SEMI JOIN"
]);
var reservedKeywordPhrases5 = expandPhrases([
  "{ROWS | RANGE | GROUPS} BETWEEN",
  "SIMILAR TO",
  "IS [NOT] DISTINCT FROM"
]);
var reservedDataTypePhrases4 = expandPhrases(["TIMESTAMP WITH TIME ZONE"]);
var duckdb = {
  name: "duckdb",
  tokenizerOptions: {
    reservedSelect: reservedSelect5,
    reservedClauses: [...reservedClauses5, ...standardOnelineClauses5, ...tabularOnelineClauses5],
    reservedSetOperations: reservedSetOperations5,
    reservedJoins: reservedJoins5,
    reservedKeywordPhrases: reservedKeywordPhrases5,
    reservedDataTypePhrases: reservedDataTypePhrases4,
    supportsXor: true,
    reservedKeywords: keywords5,
    reservedDataTypes: dataTypes5,
    reservedFunctionNames: functions5,
    nestedBlockComments: true,
    extraParens: ["[]", "{}"],
    underscoresInNumbers: true,
    stringTypes: [
      "$$",
      "''-qq",
      { quote: "''-qq-bs", prefixes: ["E"], requirePrefix: true },
      { quote: "''-raw", prefixes: ["B", "X"], requirePrefix: true }
    ],
    identTypes: [`""-qq`],
    identChars: { rest: "$" },
    // TODO: named params $foo currently conflict with $$-quoted strings
    paramTypes: { positional: true, numbered: ["$"], quoted: ["$"] },
    operators: [
      // Arithmetic:
      "//",
      "%",
      "**",
      "^",
      "!",
      // Bitwise:
      "&",
      "|",
      "~",
      "<<",
      ">>",
      // Cast:
      "::",
      // Comparison:
      "==",
      // Lambda & JSON:
      "->",
      // JSON:
      "->>",
      // key-value separator:
      ":",
      // Named function params:
      ":=",
      "=>",
      // Pattern matching:
      "~~",
      "!~~",
      "~~*",
      "!~~*",
      "~~~",
      // Regular expressions:
      "~",
      "!~",
      "~*",
      "!~*",
      // String:
      "^@",
      "||",
      // INET extension:
      ">>=",
      "<<="
    ]
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: [...standardOnelineClauses5, ...tabularOnelineClauses5],
    tabularOnelineClauses: tabularOnelineClauses5
  }
};

// node_modules/sql-formatter/dist/esm/languages/hive/hive.functions.js
var functions6 = [
  // https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF
  // math
  "ABS",
  "ACOS",
  "ASIN",
  "ATAN",
  "BIN",
  "BROUND",
  "CBRT",
  "CEIL",
  "CEILING",
  "CONV",
  "COS",
  "DEGREES",
  // 'E',
  "EXP",
  "FACTORIAL",
  "FLOOR",
  "GREATEST",
  "HEX",
  "LEAST",
  "LN",
  "LOG",
  "LOG10",
  "LOG2",
  "NEGATIVE",
  "PI",
  "PMOD",
  "POSITIVE",
  "POW",
  "POWER",
  "RADIANS",
  "RAND",
  "ROUND",
  "SHIFTLEFT",
  "SHIFTRIGHT",
  "SHIFTRIGHTUNSIGNED",
  "SIGN",
  "SIN",
  "SQRT",
  "TAN",
  "UNHEX",
  "WIDTH_BUCKET",
  // array
  "ARRAY_CONTAINS",
  "MAP_KEYS",
  "MAP_VALUES",
  "SIZE",
  "SORT_ARRAY",
  // conversion
  "BINARY",
  "CAST",
  // date
  "ADD_MONTHS",
  "DATE",
  "DATE_ADD",
  "DATE_FORMAT",
  "DATE_SUB",
  "DATEDIFF",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFYEAR",
  "EXTRACT",
  "FROM_UNIXTIME",
  "FROM_UTC_TIMESTAMP",
  "HOUR",
  "LAST_DAY",
  "MINUTE",
  "MONTH",
  "MONTHS_BETWEEN",
  "NEXT_DAY",
  "QUARTER",
  "SECOND",
  "TIMESTAMP",
  "TO_DATE",
  "TO_UTC_TIMESTAMP",
  "TRUNC",
  "UNIX_TIMESTAMP",
  "WEEKOFYEAR",
  "YEAR",
  // conditional
  "ASSERT_TRUE",
  "COALESCE",
  "IF",
  "ISNOTNULL",
  "ISNULL",
  "NULLIF",
  "NVL",
  // string
  "ASCII",
  "BASE64",
  "CHARACTER_LENGTH",
  "CHR",
  "CONCAT",
  "CONCAT_WS",
  "CONTEXT_NGRAMS",
  "DECODE",
  "ELT",
  "ENCODE",
  "FIELD",
  "FIND_IN_SET",
  "FORMAT_NUMBER",
  "GET_JSON_OBJECT",
  "IN_FILE",
  "INITCAP",
  "INSTR",
  "LCASE",
  "LENGTH",
  "LEVENSHTEIN",
  "LOCATE",
  "LOWER",
  "LPAD",
  "LTRIM",
  "NGRAMS",
  "OCTET_LENGTH",
  "PARSE_URL",
  "PRINTF",
  "QUOTE",
  "REGEXP_EXTRACT",
  "REGEXP_REPLACE",
  "REPEAT",
  "REVERSE",
  "RPAD",
  "RTRIM",
  "SENTENCES",
  "SOUNDEX",
  "SPACE",
  "SPLIT",
  "STR_TO_MAP",
  "SUBSTR",
  "SUBSTRING",
  "TRANSLATE",
  "TRIM",
  "UCASE",
  "UNBASE64",
  "UPPER",
  // masking
  "MASK",
  "MASK_FIRST_N",
  "MASK_HASH",
  "MASK_LAST_N",
  "MASK_SHOW_FIRST_N",
  "MASK_SHOW_LAST_N",
  // misc
  "AES_DECRYPT",
  "AES_ENCRYPT",
  "CRC32",
  "CURRENT_DATABASE",
  "CURRENT_USER",
  "HASH",
  "JAVA_METHOD",
  "LOGGED_IN_USER",
  "MD5",
  "REFLECT",
  "SHA",
  "SHA1",
  "SHA2",
  "SURROGATE_KEY",
  "VERSION",
  // aggregate
  "AVG",
  "COLLECT_LIST",
  "COLLECT_SET",
  "CORR",
  "COUNT",
  "COVAR_POP",
  "COVAR_SAMP",
  "HISTOGRAM_NUMERIC",
  "MAX",
  "MIN",
  "NTILE",
  "PERCENTILE",
  "PERCENTILE_APPROX",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "SUM",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  // table
  "EXPLODE",
  "INLINE",
  "JSON_TUPLE",
  "PARSE_URL_TUPLE",
  "POSEXPLODE",
  "STACK",
  // https://cwiki.apache.org/confluence/display/Hive/LanguageManual+WindowingAndAnalytics
  "LEAD",
  "LAG",
  "FIRST_VALUE",
  "LAST_VALUE",
  "RANK",
  "ROW_NUMBER",
  "DENSE_RANK",
  "CUME_DIST",
  "PERCENT_RANK",
  "NTILE"
];

// node_modules/sql-formatter/dist/esm/languages/hive/hive.keywords.js
var keywords6 = [
  // https://cwiki.apache.org/confluence/display/hive/languagemanual+ddl
  // Non-reserved keywords have proscribed meanings in. HiveQL, but can still be used as table or column names
  "ADD",
  "ADMIN",
  "AFTER",
  "ANALYZE",
  "ARCHIVE",
  "ASC",
  "BEFORE",
  "BUCKET",
  "BUCKETS",
  "CASCADE",
  "CHANGE",
  "CLUSTER",
  "CLUSTERED",
  "CLUSTERSTATUS",
  "COLLECTION",
  "COLUMNS",
  "COMMENT",
  "COMPACT",
  "COMPACTIONS",
  "COMPUTE",
  "CONCATENATE",
  "CONTINUE",
  "DATA",
  "DATABASES",
  "DATETIME",
  "DAY",
  "DBPROPERTIES",
  "DEFERRED",
  "DEFINED",
  "DELIMITED",
  "DEPENDENCY",
  "DESC",
  "DIRECTORIES",
  "DIRECTORY",
  "DISABLE",
  "DISTRIBUTE",
  "ELEM_TYPE",
  "ENABLE",
  "ESCAPED",
  "EXCLUSIVE",
  "EXPLAIN",
  "EXPORT",
  "FIELDS",
  "FILE",
  "FILEFORMAT",
  "FIRST",
  "FORMAT",
  "FORMATTED",
  "FUNCTIONS",
  "HOLD_DDLTIME",
  "HOUR",
  "IDXPROPERTIES",
  "IGNORE",
  "INDEX",
  "INDEXES",
  "INPATH",
  "INPUTDRIVER",
  "INPUTFORMAT",
  "ITEMS",
  "JAR",
  "KEYS",
  "KEY_TYPE",
  "LIMIT",
  "LINES",
  "LOAD",
  "LOCATION",
  "LOCK",
  "LOCKS",
  "LOGICAL",
  "LONG",
  "MAPJOIN",
  "MATERIALIZED",
  "METADATA",
  "MINUS",
  "MINUTE",
  "MONTH",
  "MSCK",
  "NOSCAN",
  "NO_DROP",
  "OFFLINE",
  "OPTION",
  "OUTPUTDRIVER",
  "OUTPUTFORMAT",
  "OVERWRITE",
  "OWNER",
  "PARTITIONED",
  "PARTITIONS",
  "PLUS",
  "PRETTY",
  "PRINCIPALS",
  "PROTECTION",
  "PURGE",
  "READ",
  "READONLY",
  "REBUILD",
  "RECORDREADER",
  "RECORDWRITER",
  "RELOAD",
  "RENAME",
  "REPAIR",
  "REPLACE",
  "REPLICATION",
  "RESTRICT",
  "REWRITE",
  "ROLE",
  "ROLES",
  "SCHEMA",
  "SCHEMAS",
  "SECOND",
  "SEMI",
  "SERDE",
  "SERDEPROPERTIES",
  "SERVER",
  "SETS",
  "SHARED",
  "SHOW",
  "SHOW_DATABASE",
  "SKEWED",
  "SORT",
  "SORTED",
  "SSL",
  "STATISTICS",
  "STORED",
  "STREAMTABLE",
  "STRING",
  "TABLES",
  "TBLPROPERTIES",
  "TEMPORARY",
  "TERMINATED",
  "TINYINT",
  "TOUCH",
  "TRANSACTIONS",
  "UNARCHIVE",
  "UNDO",
  "UNIONTYPE",
  "UNLOCK",
  "UNSET",
  "UNSIGNED",
  "URI",
  "USE",
  "UTC",
  "UTCTIMESTAMP",
  "VALUE_TYPE",
  "VIEW",
  "WHILE",
  "YEAR",
  "AUTOCOMMIT",
  "ISOLATION",
  "LEVEL",
  "OFFSET",
  "SNAPSHOT",
  "TRANSACTION",
  "WORK",
  "WRITE",
  "ABORT",
  "KEY",
  "LAST",
  "NORELY",
  "NOVALIDATE",
  "NULLS",
  "RELY",
  "VALIDATE",
  "DETAIL",
  "DOW",
  "EXPRESSION",
  "OPERATOR",
  "QUARTER",
  "SUMMARY",
  "VECTORIZATION",
  "WEEK",
  "YEARS",
  "MONTHS",
  "WEEKS",
  "DAYS",
  "HOURS",
  "MINUTES",
  "SECONDS",
  "TIMESTAMPTZ",
  "ZONE",
  // reserved
  "ALL",
  "ALTER",
  "AND",
  "AS",
  "AUTHORIZATION",
  "BETWEEN",
  "BOTH",
  "BY",
  "CASE",
  "CAST",
  "COLUMN",
  "CONF",
  "CREATE",
  "CROSS",
  "CUBE",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIMESTAMP",
  "CURSOR",
  "DATABASE",
  "DELETE",
  "DESCRIBE",
  "DISTINCT",
  "DROP",
  "ELSE",
  "END",
  "EXCHANGE",
  "EXISTS",
  "EXTENDED",
  "EXTERNAL",
  "FALSE",
  "FETCH",
  "FOLLOWING",
  "FOR",
  "FROM",
  "FULL",
  "FUNCTION",
  "GRANT",
  "GROUP",
  "GROUPING",
  "HAVING",
  "IF",
  "IMPORT",
  "IN",
  "INNER",
  "INSERT",
  "INTERSECT",
  "INTO",
  "IS",
  "JOIN",
  "LATERAL",
  "LEFT",
  "LESS",
  "LIKE",
  "LOCAL",
  "MACRO",
  "MORE",
  "NONE",
  "NOT",
  "NULL",
  "OF",
  "ON",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OVER",
  "PARTIALSCAN",
  "PARTITION",
  "PERCENT",
  "PRECEDING",
  "PRESERVE",
  "PROCEDURE",
  "RANGE",
  "READS",
  "REDUCE",
  "REVOKE",
  "RIGHT",
  "ROLLUP",
  "ROW",
  "ROWS",
  "SELECT",
  "SET",
  "TABLE",
  "TABLESAMPLE",
  "THEN",
  "TO",
  "TRANSFORM",
  "TRIGGER",
  "TRUE",
  "TRUNCATE",
  "UNBOUNDED",
  "UNION",
  "UNIQUEJOIN",
  "UPDATE",
  "USER",
  "USING",
  "UTC_TMESTAMP",
  "VALUES",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "COMMIT",
  "ONLY",
  "REGEXP",
  "RLIKE",
  "ROLLBACK",
  "START",
  "CACHE",
  "CONSTRAINT",
  "FOREIGN",
  "PRIMARY",
  "REFERENCES",
  "DAYOFWEEK",
  "EXTRACT",
  "FLOOR",
  "VIEWS",
  "TIME",
  "SYNC",
  // fileTypes
  "TEXTFILE",
  "SEQUENCEFILE",
  "ORC",
  "CSV",
  "TSV",
  "PARQUET",
  "AVRO",
  "RCFILE",
  "JSONFILE",
  "INPUTFORMAT",
  "OUTPUTFORMAT"
];
var dataTypes6 = [
  // https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Types
  "ARRAY",
  "BIGINT",
  "BINARY",
  "BOOLEAN",
  "CHAR",
  "DATE",
  "DECIMAL",
  "DOUBLE",
  "FLOAT",
  "INT",
  "INTEGER",
  "INTERVAL",
  "MAP",
  "NUMERIC",
  "PRECISION",
  "SMALLINT",
  "STRUCT",
  "TIMESTAMP",
  "VARCHAR"
];

// node_modules/sql-formatter/dist/esm/languages/hive/hive.formatter.js
var reservedSelect6 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses6 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "SORT BY",
  "CLUSTER BY",
  "DISTRIBUTE BY",
  "LIMIT",
  // Data manipulation
  // - insert:
  //   Hive does not actually support plain INSERT INTO, only INSERT INTO TABLE
  //   but it's a nuisance to not support it, as all other dialects do.
  "INSERT INTO [TABLE]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  "INSERT [VALUES]",
  // - insert overwrite directory:
  //   https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML#LanguageManualDML-Writingdataintothefilesystemfromqueries
  "INSERT OVERWRITE [LOCAL] DIRECTORY",
  // - load:
  //   https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML#LanguageManualDML-Loadingfilesintotables
  "LOAD DATA [LOCAL] INPATH",
  "[OVERWRITE] INTO TABLE"
]);
var standardOnelineClauses6 = expandPhrases([
  "CREATE [TEMPORARY] [EXTERNAL] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses6 = expandPhrases([
  // - create:
  "CREATE [MATERIALIZED] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "RENAME TO",
  // - truncate:
  "TRUNCATE [TABLE]",
  // other
  "ALTER",
  "CREATE",
  "USE",
  "DESCRIBE",
  "DROP",
  "FETCH",
  "SHOW",
  "STORED AS",
  "STORED BY",
  "ROW FORMAT"
]);
var reservedSetOperations6 = expandPhrases(["UNION [ALL | DISTINCT]"]);
var reservedJoins6 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  // non-standard joins
  "LEFT SEMI JOIN"
]);
var reservedPhrases = expandPhrases(["{ROWS | RANGE} BETWEEN"]);
var reservedDataTypePhrases5 = expandPhrases([]);
var hive = {
  name: "hive",
  tokenizerOptions: {
    reservedSelect: reservedSelect6,
    reservedClauses: [...reservedClauses6, ...standardOnelineClauses6, ...tabularOnelineClauses6],
    reservedSetOperations: reservedSetOperations6,
    reservedJoins: reservedJoins6,
    reservedKeywordPhrases: reservedPhrases,
    reservedDataTypePhrases: reservedDataTypePhrases5,
    reservedKeywords: keywords6,
    reservedDataTypes: dataTypes6,
    reservedFunctionNames: functions6,
    extraParens: ["[]"],
    stringTypes: ['""-bs', "''-bs"],
    identTypes: ["``"],
    variableTypes: [{ quote: "{}", prefixes: ["$"], requirePrefix: true }],
    operators: ["%", "~", "^", "|", "&", "<=>", "==", "!", "||"]
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses6, ...tabularOnelineClauses6],
    tabularOnelineClauses: tabularOnelineClauses6
  }
};

// node_modules/sql-formatter/dist/esm/languages/mariadb/likeMariaDb.js
function postProcess3(tokens) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.SET(token) && nextToken.text === "(") {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_FUNCTION_NAME });
    }
    const prevToken = tokens[i - 1] || EOF_TOKEN;
    if (isToken.VALUES(token) && prevToken.text === "=") {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_FUNCTION_NAME });
    }
    return token;
  });
}

// node_modules/sql-formatter/dist/esm/languages/mariadb/mariadb.keywords.js
var keywords7 = [
  // https://mariadb.com/kb/en/reserved-words/
  "ACCESSIBLE",
  "ADD",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "AS",
  "ASC",
  "ASENSITIVE",
  "BEFORE",
  "BETWEEN",
  "BOTH",
  "BY",
  "CALL",
  "CASCADE",
  "CASE",
  "CHANGE",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "CONDITION",
  "CONSTRAINT",
  "CONTINUE",
  "CONVERT",
  "CREATE",
  "CROSS",
  "CURRENT_DATE",
  "CURRENT_ROLE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURSOR",
  "DATABASE",
  "DATABASES",
  "DAY_HOUR",
  "DAY_MICROSECOND",
  "DAY_MINUTE",
  "DAY_SECOND",
  "DECLARE",
  "DEFAULT",
  "DELAYED",
  "DELETE",
  "DELETE_DOMAIN_ID",
  "DESC",
  "DESCRIBE",
  "DETERMINISTIC",
  "DISTINCT",
  "DISTINCTROW",
  "DIV",
  "DO_DOMAIN_IDS",
  "DROP",
  "DUAL",
  "EACH",
  "ELSE",
  "ELSEIF",
  "ENCLOSED",
  "ESCAPED",
  "EXCEPT",
  "EXISTS",
  "EXIT",
  "EXPLAIN",
  "FALSE",
  "FETCH",
  "FOR",
  "FORCE",
  "FOREIGN",
  "FROM",
  "FULLTEXT",
  "GENERAL",
  "GRANT",
  "GROUP",
  "HAVING",
  "HIGH_PRIORITY",
  "HOUR_MICROSECOND",
  "HOUR_MINUTE",
  "HOUR_SECOND",
  "IF",
  "IGNORE",
  "IGNORE_DOMAIN_IDS",
  "IGNORE_SERVER_IDS",
  "IN",
  "INDEX",
  "INFILE",
  "INNER",
  "INOUT",
  "INSENSITIVE",
  "INSERT",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "IS",
  "ITERATE",
  "JOIN",
  "KEY",
  "KEYS",
  "KILL",
  "LEADING",
  "LEAVE",
  "LEFT",
  "LIKE",
  "LIMIT",
  "LINEAR",
  "LINES",
  "LOAD",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCK",
  "LOOP",
  "LOW_PRIORITY",
  "MASTER_HEARTBEAT_PERIOD",
  "MASTER_SSL_VERIFY_SERVER_CERT",
  "MATCH",
  "MAXVALUE",
  "MINUTE_MICROSECOND",
  "MINUTE_SECOND",
  "MOD",
  "MODIFIES",
  "NATURAL",
  "NOT",
  "NO_WRITE_TO_BINLOG",
  "NULL",
  "OFFSET",
  "ON",
  "OPTIMIZE",
  "OPTION",
  "OPTIONALLY",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OUTFILE",
  "OVER",
  "PAGE_CHECKSUM",
  "PARSE_VCOL_EXPR",
  "PARTITION",
  "POSITION",
  "PRIMARY",
  "PROCEDURE",
  "PURGE",
  "RANGE",
  "READ",
  "READS",
  "READ_WRITE",
  "RECURSIVE",
  "REF_SYSTEM_ID",
  "REFERENCES",
  "REGEXP",
  "RELEASE",
  "RENAME",
  "REPEAT",
  "REPLACE",
  "REQUIRE",
  "RESIGNAL",
  "RESTRICT",
  "RETURN",
  "RETURNING",
  "REVOKE",
  "RIGHT",
  "RLIKE",
  "ROW_NUMBER",
  "ROWS",
  "SCHEMA",
  "SCHEMAS",
  "SECOND_MICROSECOND",
  "SELECT",
  "SENSITIVE",
  "SEPARATOR",
  "SET",
  "SHOW",
  "SIGNAL",
  "SLOW",
  "SPATIAL",
  "SPECIFIC",
  "SQL",
  "SQLEXCEPTION",
  "SQLSTATE",
  "SQLWARNING",
  "SQL_BIG_RESULT",
  "SQL_CALC_FOUND_ROWS",
  "SQL_SMALL_RESULT",
  "SSL",
  "STARTING",
  "STATS_AUTO_RECALC",
  "STATS_PERSISTENT",
  "STATS_SAMPLE_PAGES",
  "STRAIGHT_JOIN",
  "TABLE",
  "TERMINATED",
  "THEN",
  "TO",
  "TRAILING",
  "TRIGGER",
  "TRUE",
  "UNDO",
  "UNION",
  "UNIQUE",
  "UNLOCK",
  "UNSIGNED",
  "UPDATE",
  "USAGE",
  "USE",
  "USING",
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "VALUES",
  "WHEN",
  "WHERE",
  "WHILE",
  "WINDOW",
  "WITH",
  "WRITE",
  "XOR",
  "YEAR_MONTH",
  "ZEROFILL"
];
var dataTypes7 = [
  // https://mariadb.com/kb/en/data-types/
  "BIGINT",
  "BINARY",
  "BIT",
  "BLOB",
  "CHAR BYTE",
  "CHAR",
  "CHARACTER",
  "DATETIME",
  "DEC",
  "DECIMAL",
  "DOUBLE PRECISION",
  "DOUBLE",
  "ENUM",
  "FIXED",
  "FLOAT",
  "FLOAT4",
  "FLOAT8",
  "INT",
  "INT1",
  "INT2",
  "INT3",
  "INT4",
  "INT8",
  "INTEGER",
  "LONG",
  "LONGBLOB",
  "LONGTEXT",
  "MEDIUMBLOB",
  "MEDIUMINT",
  "MEDIUMTEXT",
  "MIDDLEINT",
  "NATIONAL CHAR",
  "NATIONAL VARCHAR",
  "NUMERIC",
  "PRECISION",
  "REAL",
  "SMALLINT",
  "TEXT",
  "TIMESTAMP",
  "TINYBLOB",
  "TINYINT",
  "TINYTEXT",
  "VARBINARY",
  "VARCHAR",
  "VARCHARACTER",
  "VARYING",
  "YEAR"
  // 'NUMBER', // ?? In oracle mode only
  // 'SET' // handled as special-case in postProcess
];

// node_modules/sql-formatter/dist/esm/languages/mariadb/mariadb.functions.js
var functions7 = [
  // https://mariadb.com/kb/en/information-schema-sql_functions-table/
  "ADDDATE",
  "ADD_MONTHS",
  "BIT_AND",
  "BIT_OR",
  "BIT_XOR",
  "CAST",
  "COUNT",
  "CUME_DIST",
  "CURDATE",
  "CURTIME",
  "DATE_ADD",
  "DATE_SUB",
  "DATE_FORMAT",
  "DECODE",
  "DENSE_RANK",
  "EXTRACT",
  "FIRST_VALUE",
  "GROUP_CONCAT",
  "JSON_ARRAYAGG",
  "JSON_OBJECTAGG",
  "LAG",
  "LEAD",
  "MAX",
  "MEDIAN",
  "MID",
  "MIN",
  "NOW",
  "NTH_VALUE",
  "NTILE",
  "POSITION",
  "PERCENT_RANK",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "RANK",
  "ROW_NUMBER",
  "SESSION_USER",
  "STD",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "SUBDATE",
  "SUBSTR",
  "SUBSTRING",
  "SUM",
  "SYSTEM_USER",
  "TRIM",
  "TRIM_ORACLE",
  "VARIANCE",
  "VAR_POP",
  "VAR_SAMP",
  "ABS",
  "ACOS",
  "ADDTIME",
  "AES_DECRYPT",
  "AES_ENCRYPT",
  "ASIN",
  "ATAN",
  "ATAN2",
  "BENCHMARK",
  "BIN",
  "BINLOG_GTID_POS",
  "BIT_COUNT",
  "BIT_LENGTH",
  "CEIL",
  "CEILING",
  "CHARACTER_LENGTH",
  "CHAR_LENGTH",
  "CHR",
  "COERCIBILITY",
  "COLUMN_CHECK",
  "COLUMN_EXISTS",
  "COLUMN_LIST",
  "COLUMN_JSON",
  "COMPRESS",
  "CONCAT",
  "CONCAT_OPERATOR_ORACLE",
  "CONCAT_WS",
  "CONNECTION_ID",
  "CONV",
  "CONVERT_TZ",
  "COS",
  "COT",
  "CRC32",
  "DATEDIFF",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DEGREES",
  "DECODE_HISTOGRAM",
  "DECODE_ORACLE",
  "DES_DECRYPT",
  "DES_ENCRYPT",
  "ELT",
  "ENCODE",
  "ENCRYPT",
  "EXP",
  "EXPORT_SET",
  "EXTRACTVALUE",
  "FIELD",
  "FIND_IN_SET",
  "FLOOR",
  "FORMAT",
  "FOUND_ROWS",
  "FROM_BASE64",
  "FROM_DAYS",
  "FROM_UNIXTIME",
  "GET_LOCK",
  "GREATEST",
  "HEX",
  "IFNULL",
  "INSTR",
  "ISNULL",
  "IS_FREE_LOCK",
  "IS_USED_LOCK",
  "JSON_ARRAY",
  "JSON_ARRAY_APPEND",
  "JSON_ARRAY_INSERT",
  "JSON_COMPACT",
  "JSON_CONTAINS",
  "JSON_CONTAINS_PATH",
  "JSON_DEPTH",
  "JSON_DETAILED",
  "JSON_EXISTS",
  "JSON_EXTRACT",
  "JSON_INSERT",
  "JSON_KEYS",
  "JSON_LENGTH",
  "JSON_LOOSE",
  "JSON_MERGE",
  "JSON_MERGE_PATCH",
  "JSON_MERGE_PRESERVE",
  "JSON_QUERY",
  "JSON_QUOTE",
  "JSON_OBJECT",
  "JSON_REMOVE",
  "JSON_REPLACE",
  "JSON_SET",
  "JSON_SEARCH",
  "JSON_TYPE",
  "JSON_UNQUOTE",
  "JSON_VALID",
  "JSON_VALUE",
  "LAST_DAY",
  "LAST_INSERT_ID",
  "LCASE",
  "LEAST",
  "LENGTH",
  "LENGTHB",
  "LN",
  "LOAD_FILE",
  "LOCATE",
  "LOG",
  "LOG10",
  "LOG2",
  "LOWER",
  "LPAD",
  "LPAD_ORACLE",
  "LTRIM",
  "LTRIM_ORACLE",
  "MAKEDATE",
  "MAKETIME",
  "MAKE_SET",
  "MASTER_GTID_WAIT",
  "MASTER_POS_WAIT",
  "MD5",
  "MONTHNAME",
  "NAME_CONST",
  "NVL",
  "NVL2",
  "OCT",
  "OCTET_LENGTH",
  "ORD",
  "PERIOD_ADD",
  "PERIOD_DIFF",
  "PI",
  "POW",
  "POWER",
  "QUOTE",
  "REGEXP_INSTR",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "RADIANS",
  "RAND",
  "RELEASE_ALL_LOCKS",
  "RELEASE_LOCK",
  "REPLACE_ORACLE",
  "REVERSE",
  "ROUND",
  "RPAD",
  "RPAD_ORACLE",
  "RTRIM",
  "RTRIM_ORACLE",
  "SEC_TO_TIME",
  "SHA",
  "SHA1",
  "SHA2",
  "SIGN",
  "SIN",
  "SLEEP",
  "SOUNDEX",
  "SPACE",
  "SQRT",
  "STRCMP",
  "STR_TO_DATE",
  "SUBSTR_ORACLE",
  "SUBSTRING_INDEX",
  "SUBTIME",
  "SYS_GUID",
  "TAN",
  "TIMEDIFF",
  "TIME_FORMAT",
  "TIME_TO_SEC",
  "TO_BASE64",
  "TO_CHAR",
  "TO_DAYS",
  "TO_SECONDS",
  "UCASE",
  "UNCOMPRESS",
  "UNCOMPRESSED_LENGTH",
  "UNHEX",
  "UNIX_TIMESTAMP",
  "UPDATEXML",
  "UPPER",
  "UUID",
  "UUID_SHORT",
  "VERSION",
  "WEEKDAY",
  "WEEKOFYEAR",
  "WSREP_LAST_WRITTEN_GTID",
  "WSREP_LAST_SEEN_GTID",
  "WSREP_SYNC_WAIT_UPTO_GTID",
  "YEARWEEK",
  // CASE expression shorthands
  "COALESCE",
  "NULLIF"
];

// node_modules/sql-formatter/dist/esm/languages/mariadb/mariadb.formatter.js
var reservedSelect7 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses7 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]",
  "REPLACE [LOW_PRIORITY | DELAYED] [INTO]",
  "VALUES",
  "ON DUPLICATE KEY UPDATE",
  // - update:
  "SET",
  // other
  "RETURNING"
]);
var standardOnelineClauses7 = expandPhrases([
  "CREATE [OR REPLACE] [TEMPORARY] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses7 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE [LOW_PRIORITY] [IGNORE]",
  // - delete:
  "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM",
  // - drop table:
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER [ONLINE] [IGNORE] TABLE [IF EXISTS]",
  "ADD [COLUMN] [IF NOT EXISTS]",
  "{CHANGE | MODIFY} [COLUMN] [IF EXISTS]",
  "DROP [COLUMN] [IF EXISTS]",
  "RENAME [TO]",
  "RENAME COLUMN",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  "SET {VISIBLE | INVISIBLE}",
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://mariadb.com/docs/reference/mdb/sql-statements/
  "ALTER DATABASE",
  "ALTER DATABASE COMMENT",
  "ALTER EVENT",
  "ALTER FUNCTION",
  "ALTER PROCEDURE",
  "ALTER SCHEMA",
  "ALTER SCHEMA COMMENT",
  "ALTER SEQUENCE",
  "ALTER SERVER",
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE",
  "ANALYZE TABLE",
  "BACKUP LOCK",
  "BACKUP STAGE",
  "BACKUP UNLOCK",
  "BEGIN",
  "BINLOG",
  "CACHE INDEX",
  "CALL",
  "CHANGE MASTER TO",
  "CHECK TABLE",
  "CHECK VIEW",
  "CHECKSUM TABLE",
  "COMMIT",
  "CREATE AGGREGATE FUNCTION",
  "CREATE DATABASE",
  "CREATE EVENT",
  "CREATE FUNCTION",
  "CREATE INDEX",
  "CREATE PROCEDURE",
  "CREATE ROLE",
  "CREATE SEQUENCE",
  "CREATE SERVER",
  "CREATE SPATIAL INDEX",
  "CREATE TRIGGER",
  "CREATE UNIQUE INDEX",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DROP DATABASE",
  "DROP EVENT",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP PREPARE",
  "DROP PROCEDURE",
  "DROP ROLE",
  "DROP SEQUENCE",
  "DROP SERVER",
  "DROP TRIGGER",
  "DROP USER",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FLUSH",
  "GET DIAGNOSTICS",
  "GET DIAGNOSTICS CONDITION",
  "GRANT",
  "HANDLER",
  "HELP",
  "INSTALL PLUGIN",
  "INSTALL SONAME",
  "KILL",
  "LOAD DATA INFILE",
  "LOAD INDEX INTO CACHE",
  "LOAD XML INFILE",
  "LOCK TABLE",
  "OPTIMIZE TABLE",
  "PREPARE",
  "PURGE BINARY LOGS",
  "PURGE MASTER LOGS",
  "RELEASE SAVEPOINT",
  "RENAME TABLE",
  "RENAME USER",
  "REPAIR TABLE",
  "REPAIR VIEW",
  "RESET MASTER",
  "RESET QUERY CACHE",
  "RESET REPLICA",
  "RESET SLAVE",
  "RESIGNAL",
  "REVOKE",
  "ROLLBACK",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET GLOBAL TRANSACTION",
  "SET NAMES",
  "SET PASSWORD",
  "SET ROLE",
  "SET STATEMENT",
  "SET TRANSACTION",
  "SHOW",
  "SHOW ALL REPLICAS STATUS",
  "SHOW ALL SLAVES STATUS",
  "SHOW AUTHORS",
  "SHOW BINARY LOGS",
  "SHOW BINLOG EVENTS",
  "SHOW BINLOG STATUS",
  "SHOW CHARACTER SET",
  "SHOW CLIENT_STATISTICS",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CONTRIBUTORS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE EVENT",
  "SHOW CREATE FUNCTION",
  "SHOW CREATE PACKAGE",
  "SHOW CREATE PACKAGE BODY",
  "SHOW CREATE PROCEDURE",
  "SHOW CREATE SEQUENCE",
  "SHOW CREATE TABLE",
  "SHOW CREATE TRIGGER",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINE INNODB STATUS",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW EVENTS",
  "SHOW EXPLAIN",
  "SHOW FUNCTION CODE",
  "SHOW FUNCTION STATUS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW INDEXES",
  "SHOW INDEX_STATISTICS",
  "SHOW KEYS",
  "SHOW LOCALES",
  "SHOW MASTER LOGS",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PACKAGE BODY CODE",
  "SHOW PACKAGE BODY STATUS",
  "SHOW PACKAGE STATUS",
  "SHOW PLUGINS",
  "SHOW PLUGINS SONAME",
  "SHOW PRIVILEGES",
  "SHOW PROCEDURE CODE",
  "SHOW PROCEDURE STATUS",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW QUERY_RESPONSE_TIME",
  "SHOW RELAYLOG EVENTS",
  "SHOW REPLICA",
  "SHOW REPLICA HOSTS",
  "SHOW REPLICA STATUS",
  "SHOW SCHEMAS",
  "SHOW SLAVE",
  "SHOW SLAVE HOSTS",
  "SHOW SLAVE STATUS",
  "SHOW STATUS",
  "SHOW STORAGE ENGINES",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW TRIGGERS",
  "SHOW USER_STATISTICS",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  "SHOW WSREP_MEMBERSHIP",
  "SHOW WSREP_STATUS",
  "SHUTDOWN",
  "SIGNAL",
  "START ALL REPLICAS",
  "START ALL SLAVES",
  "START REPLICA",
  "START SLAVE",
  "START TRANSACTION",
  "STOP ALL REPLICAS",
  "STOP ALL SLAVES",
  "STOP REPLICA",
  "STOP SLAVE",
  "UNINSTALL PLUGIN",
  "UNINSTALL SONAME",
  "UNLOCK TABLE",
  "USE",
  "XA BEGIN",
  "XA COMMIT",
  "XA END",
  "XA PREPARE",
  "XA RECOVER",
  "XA ROLLBACK",
  "XA START"
]);
var reservedSetOperations7 = expandPhrases([
  "UNION [ALL | DISTINCT]",
  "EXCEPT [ALL | DISTINCT]",
  "INTERSECT [ALL | DISTINCT]",
  "MINUS [ALL | DISTINCT]"
]);
var reservedJoins7 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedKeywordPhrases6 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]",
  "CHARACTER SET",
  "{ROWS | RANGE} BETWEEN",
  "IDENTIFIED BY"
]);
var reservedDataTypePhrases6 = expandPhrases([]);
var mariadb = {
  name: "mariadb",
  tokenizerOptions: {
    reservedSelect: reservedSelect7,
    reservedClauses: [...reservedClauses7, ...standardOnelineClauses7, ...tabularOnelineClauses7],
    reservedSetOperations: reservedSetOperations7,
    reservedJoins: reservedJoins7,
    reservedKeywordPhrases: reservedKeywordPhrases6,
    reservedDataTypePhrases: reservedDataTypePhrases6,
    supportsXor: true,
    reservedKeywords: keywords7,
    reservedDataTypes: dataTypes7,
    reservedFunctionNames: functions7,
    // TODO: support _ char set prefixes such as _utf8, _latin1, _binary, _utf8mb4, etc.
    stringTypes: [
      '""-qq-bs',
      "''-qq-bs",
      { quote: "''-raw", prefixes: ["B", "X"], requirePrefix: true }
    ],
    identTypes: ["``"],
    identChars: { first: "$", rest: "$", allowFirstCharNumber: true },
    variableTypes: [
      { regex: "@@?[A-Za-z0-9_.$]+" },
      { quote: '""-qq-bs', prefixes: ["@"], requirePrefix: true },
      { quote: "''-qq-bs", prefixes: ["@"], requirePrefix: true },
      { quote: "``", prefixes: ["@"], requirePrefix: true }
    ],
    paramTypes: { positional: true },
    lineCommentTypes: ["--", "#"],
    operators: [
      "%",
      ":=",
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      "<=>",
      "&&",
      "||",
      "!",
      "*.*"
      // Not actually an operator
    ],
    postProcess: postProcess3
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses7, ...tabularOnelineClauses7],
    tabularOnelineClauses: tabularOnelineClauses7
  }
};

// node_modules/sql-formatter/dist/esm/languages/mysql/mysql.keywords.js
var keywords8 = [
  // https://dev.mysql.com/doc/refman/8.0/en/keywords.html
  "ACCESSIBLE",
  "ADD",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "AS",
  "ASC",
  "ASENSITIVE",
  "BEFORE",
  "BETWEEN",
  "BOTH",
  "BY",
  "CALL",
  "CASCADE",
  "CASE",
  "CHANGE",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "CONDITION",
  "CONSTRAINT",
  "CONTINUE",
  "CONVERT",
  "CREATE",
  "CROSS",
  "CUBE",
  "CUME_DIST",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURSOR",
  "DATABASE",
  "DATABASES",
  "DAY_HOUR",
  "DAY_MICROSECOND",
  "DAY_MINUTE",
  "DAY_SECOND",
  "DECLARE",
  "DEFAULT",
  "DELAYED",
  "DELETE",
  "DENSE_RANK",
  "DESC",
  "DESCRIBE",
  "DETERMINISTIC",
  "DISTINCT",
  "DISTINCTROW",
  "DIV",
  "DROP",
  "DUAL",
  "EACH",
  "ELSE",
  "ELSEIF",
  "EMPTY",
  "ENCLOSED",
  "ESCAPED",
  "EXCEPT",
  "EXISTS",
  "EXIT",
  "EXPLAIN",
  "FALSE",
  "FETCH",
  "FIRST_VALUE",
  "FOR",
  "FORCE",
  "FOREIGN",
  "FROM",
  "FULLTEXT",
  "FUNCTION",
  "GENERATED",
  "GET",
  "GRANT",
  "GROUP",
  "GROUPING",
  "GROUPS",
  "HAVING",
  "HIGH_PRIORITY",
  "HOUR_MICROSECOND",
  "HOUR_MINUTE",
  "HOUR_SECOND",
  "IF",
  "IGNORE",
  "IN",
  "INDEX",
  "INFILE",
  "INNER",
  "INOUT",
  "INSENSITIVE",
  "INSERT",
  "IN",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "IO_AFTER_GTIDS",
  "IO_BEFORE_GTIDS",
  "IS",
  "ITERATE",
  "JOIN",
  "JSON_TABLE",
  "KEY",
  "KEYS",
  "KILL",
  "LAG",
  "LAST_VALUE",
  "LATERAL",
  "LEAD",
  "LEADING",
  "LEAVE",
  "LEFT",
  "LIKE",
  "LIMIT",
  "LINEAR",
  "LINES",
  "LOAD",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCK",
  "LONG",
  "LOOP",
  "LOW_PRIORITY",
  "MASTER_BIND",
  "MASTER_SSL_VERIFY_SERVER_CERT",
  "MATCH",
  "MAXVALUE",
  "MINUTE_MICROSECOND",
  "MINUTE_SECOND",
  "MOD",
  "MODIFIES",
  "NATURAL",
  "NOT",
  "NO_WRITE_TO_BINLOG",
  "NTH_VALUE",
  "NTILE",
  "NULL",
  "OF",
  "ON",
  "OPTIMIZE",
  "OPTIMIZER_COSTS",
  "OPTION",
  "OPTIONALLY",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OUTFILE",
  "OVER",
  "PARTITION",
  "PERCENT_RANK",
  "PRIMARY",
  "PROCEDURE",
  "PURGE",
  "RANGE",
  "RANK",
  "READ",
  "READS",
  "READ_WRITE",
  "RECURSIVE",
  "REFERENCES",
  "REGEXP",
  "RELEASE",
  "RENAME",
  "REPEAT",
  "REPLACE",
  "REQUIRE",
  "RESIGNAL",
  "RESTRICT",
  "RETURN",
  "REVOKE",
  "RIGHT",
  "RLIKE",
  "ROW",
  "ROWS",
  "ROW_NUMBER",
  "SCHEMA",
  "SCHEMAS",
  "SECOND_MICROSECOND",
  "SELECT",
  "SENSITIVE",
  "SEPARATOR",
  "SET",
  "SHOW",
  "SIGNAL",
  "SPATIAL",
  "SPECIFIC",
  "SQL",
  "SQLEXCEPTION",
  "SQLSTATE",
  "SQLWARNING",
  "SQL_BIG_RESULT",
  "SQL_CALC_FOUND_ROWS",
  "SQL_SMALL_RESULT",
  "SSL",
  "STARTING",
  "STORED",
  "STRAIGHT_JOIN",
  "SYSTEM",
  "TABLE",
  "TERMINATED",
  "THEN",
  "TO",
  "TRAILING",
  "TRIGGER",
  "TRUE",
  "UNDO",
  "UNION",
  "UNIQUE",
  "UNLOCK",
  "UNSIGNED",
  "UPDATE",
  "USAGE",
  "USE",
  "USING",
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "VALUES",
  "VIRTUAL",
  "WHEN",
  "WHERE",
  "WHILE",
  "WINDOW",
  "WITH",
  "WRITE",
  "XOR",
  "YEAR_MONTH",
  "ZEROFILL"
  // (R)
];
var dataTypes8 = [
  // https://dev.mysql.com/doc/refman/8.0/en/data-types.html
  "BIGINT",
  "BINARY",
  "BIT",
  "BLOB",
  "BOOL",
  "BOOLEAN",
  "CHAR",
  "CHARACTER",
  "DATE",
  "DATETIME",
  "DEC",
  "DECIMAL",
  "DOUBLE PRECISION",
  "DOUBLE",
  "ENUM",
  "FIXED",
  "FLOAT",
  "FLOAT4",
  "FLOAT8",
  "INT",
  "INT1",
  "INT2",
  "INT3",
  "INT4",
  "INT8",
  "INTEGER",
  "LONGBLOB",
  "LONGTEXT",
  "MEDIUMBLOB",
  "MEDIUMINT",
  "MEDIUMTEXT",
  "MIDDLEINT",
  "NATIONAL CHAR",
  "NATIONAL VARCHAR",
  "NUMERIC",
  "PRECISION",
  "REAL",
  "SMALLINT",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "TINYBLOB",
  "TINYINT",
  "TINYTEXT",
  "VARBINARY",
  "VARCHAR",
  "VARCHARACTER",
  "VARYING",
  "YEAR"
  // 'SET' // handled as special-case in postProcess
];

// node_modules/sql-formatter/dist/esm/languages/mysql/mysql.functions.js
var functions8 = [
  // https://dev.mysql.com/doc/refman/8.0/en/built-in-function-reference.html
  "ABS",
  "ACOS",
  "ADDDATE",
  "ADDTIME",
  "AES_DECRYPT",
  "AES_ENCRYPT",
  // 'AND',
  "ANY_VALUE",
  "ASCII",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AVG",
  "BENCHMARK",
  "BIN",
  "BIN_TO_UUID",
  "BINARY",
  "BIT_AND",
  "BIT_COUNT",
  "BIT_LENGTH",
  "BIT_OR",
  "BIT_XOR",
  "CAN_ACCESS_COLUMN",
  "CAN_ACCESS_DATABASE",
  "CAN_ACCESS_TABLE",
  "CAN_ACCESS_USER",
  "CAN_ACCESS_VIEW",
  "CAST",
  "CEIL",
  "CEILING",
  "CHAR",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "CHARSET",
  "COALESCE",
  "COERCIBILITY",
  "COLLATION",
  "COMPRESS",
  "CONCAT",
  "CONCAT_WS",
  "CONNECTION_ID",
  "CONV",
  "CONVERT",
  "CONVERT_TZ",
  "COS",
  "COT",
  "COUNT",
  "CRC32",
  "CUME_DIST",
  "CURDATE",
  "CURRENT_DATE",
  "CURRENT_ROLE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURTIME",
  "DATABASE",
  "DATE",
  "DATE_ADD",
  "DATE_FORMAT",
  "DATE_SUB",
  "DATEDIFF",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DEFAULT",
  "DEGREES",
  "DENSE_RANK",
  "DIV",
  "ELT",
  "EXP",
  "EXPORT_SET",
  "EXTRACT",
  "EXTRACTVALUE",
  "FIELD",
  "FIND_IN_SET",
  "FIRST_VALUE",
  "FLOOR",
  "FORMAT",
  "FORMAT_BYTES",
  "FORMAT_PICO_TIME",
  "FOUND_ROWS",
  "FROM_BASE64",
  "FROM_DAYS",
  "FROM_UNIXTIME",
  "GEOMCOLLECTION",
  "GEOMETRYCOLLECTION",
  "GET_DD_COLUMN_PRIVILEGES",
  "GET_DD_CREATE_OPTIONS",
  "GET_DD_INDEX_SUB_PART_LENGTH",
  "GET_FORMAT",
  "GET_LOCK",
  "GREATEST",
  "GROUP_CONCAT",
  "GROUPING",
  "GTID_SUBSET",
  "GTID_SUBTRACT",
  "HEX",
  "HOUR",
  "ICU_VERSION",
  "IF",
  "IFNULL",
  // 'IN',
  "INET_ATON",
  "INET_NTOA",
  "INET6_ATON",
  "INET6_NTOA",
  "INSERT",
  "INSTR",
  "INTERNAL_AUTO_INCREMENT",
  "INTERNAL_AVG_ROW_LENGTH",
  "INTERNAL_CHECK_TIME",
  "INTERNAL_CHECKSUM",
  "INTERNAL_DATA_FREE",
  "INTERNAL_DATA_LENGTH",
  "INTERNAL_DD_CHAR_LENGTH",
  "INTERNAL_GET_COMMENT_OR_ERROR",
  "INTERNAL_GET_ENABLED_ROLE_JSON",
  "INTERNAL_GET_HOSTNAME",
  "INTERNAL_GET_USERNAME",
  "INTERNAL_GET_VIEW_WARNING_OR_ERROR",
  "INTERNAL_INDEX_COLUMN_CARDINALITY",
  "INTERNAL_INDEX_LENGTH",
  "INTERNAL_IS_ENABLED_ROLE",
  "INTERNAL_IS_MANDATORY_ROLE",
  "INTERNAL_KEYS_DISABLED",
  "INTERNAL_MAX_DATA_LENGTH",
  "INTERNAL_TABLE_ROWS",
  "INTERNAL_UPDATE_TIME",
  "INTERVAL",
  "IS",
  "IS_FREE_LOCK",
  "IS_IPV4",
  "IS_IPV4_COMPAT",
  "IS_IPV4_MAPPED",
  "IS_IPV6",
  "IS NOT",
  "IS NOT NULL",
  "IS NULL",
  "IS_USED_LOCK",
  "IS_UUID",
  "ISNULL",
  "JSON_ARRAY",
  "JSON_ARRAY_APPEND",
  "JSON_ARRAY_INSERT",
  "JSON_ARRAYAGG",
  "JSON_CONTAINS",
  "JSON_CONTAINS_PATH",
  "JSON_DEPTH",
  "JSON_EXTRACT",
  "JSON_INSERT",
  "JSON_KEYS",
  "JSON_LENGTH",
  "JSON_MERGE",
  "JSON_MERGE_PATCH",
  "JSON_MERGE_PRESERVE",
  "JSON_OBJECT",
  "JSON_OBJECTAGG",
  "JSON_OVERLAPS",
  "JSON_PRETTY",
  "JSON_QUOTE",
  "JSON_REMOVE",
  "JSON_REPLACE",
  "JSON_SCHEMA_VALID",
  "JSON_SCHEMA_VALIDATION_REPORT",
  "JSON_SEARCH",
  "JSON_SET",
  "JSON_STORAGE_FREE",
  "JSON_STORAGE_SIZE",
  "JSON_TABLE",
  "JSON_TYPE",
  "JSON_UNQUOTE",
  "JSON_VALID",
  "JSON_VALUE",
  "LAG",
  "LAST_DAY",
  "LAST_INSERT_ID",
  "LAST_VALUE",
  "LCASE",
  "LEAD",
  "LEAST",
  "LEFT",
  "LENGTH",
  "LIKE",
  "LINESTRING",
  "LN",
  "LOAD_FILE",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCATE",
  "LOG",
  "LOG10",
  "LOG2",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MAKE_SET",
  "MAKEDATE",
  "MAKETIME",
  "MASTER_POS_WAIT",
  "MATCH",
  "MAX",
  "MBRCONTAINS",
  "MBRCOVEREDBY",
  "MBRCOVERS",
  "MBRDISJOINT",
  "MBREQUALS",
  "MBRINTERSECTS",
  "MBROVERLAPS",
  "MBRTOUCHES",
  "MBRWITHIN",
  "MD5",
  // 'MEMBER OF',
  "MICROSECOND",
  "MID",
  "MIN",
  "MINUTE",
  "MOD",
  "MONTH",
  "MONTHNAME",
  "MULTILINESTRING",
  "MULTIPOINT",
  "MULTIPOLYGON",
  "NAME_CONST",
  // 'NOT',
  // 'NOT IN',
  // 'NOT LIKE',
  // 'NOT REGEXP',
  "NOW",
  "NTH_VALUE",
  "NTILE",
  "NULLIF",
  "OCT",
  "OCTET_LENGTH",
  // 'OR',
  "ORD",
  "PERCENT_RANK",
  "PERIOD_ADD",
  "PERIOD_DIFF",
  "PI",
  "POINT",
  "POLYGON",
  "POSITION",
  "POW",
  "POWER",
  "PS_CURRENT_THREAD_ID",
  "PS_THREAD_ID",
  "QUARTER",
  "QUOTE",
  "RADIANS",
  "RAND",
  "RANDOM_BYTES",
  "RANK",
  "REGEXP",
  "REGEXP_INSTR",
  "REGEXP_LIKE",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "RELEASE_ALL_LOCKS",
  "RELEASE_LOCK",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "RIGHT",
  "RLIKE",
  "ROLES_GRAPHML",
  "ROUND",
  "ROW_COUNT",
  "ROW_NUMBER",
  "RPAD",
  "RTRIM",
  "SCHEMA",
  "SEC_TO_TIME",
  "SECOND",
  "SESSION_USER",
  "SHA1",
  "SHA2",
  "SIGN",
  "SIN",
  "SLEEP",
  "SOUNDEX",
  "SOUNDS LIKE",
  "SOURCE_POS_WAIT",
  "SPACE",
  "SQRT",
  "ST_AREA",
  "ST_ASBINARY",
  "ST_ASGEOJSON",
  "ST_ASTEXT",
  "ST_BUFFER",
  "ST_BUFFER_STRATEGY",
  "ST_CENTROID",
  "ST_COLLECT",
  "ST_CONTAINS",
  "ST_CONVEXHULL",
  "ST_CROSSES",
  "ST_DIFFERENCE",
  "ST_DIMENSION",
  "ST_DISJOINT",
  "ST_DISTANCE",
  "ST_DISTANCE_SPHERE",
  "ST_ENDPOINT",
  "ST_ENVELOPE",
  "ST_EQUALS",
  "ST_EXTERIORRING",
  "ST_FRECHETDISTANCE",
  "ST_GEOHASH",
  "ST_GEOMCOLLFROMTEXT",
  "ST_GEOMCOLLFROMWKB",
  "ST_GEOMETRYN",
  "ST_GEOMETRYTYPE",
  "ST_GEOMFROMGEOJSON",
  "ST_GEOMFROMTEXT",
  "ST_GEOMFROMWKB",
  "ST_HAUSDORFFDISTANCE",
  "ST_INTERIORRINGN",
  "ST_INTERSECTION",
  "ST_INTERSECTS",
  "ST_ISCLOSED",
  "ST_ISEMPTY",
  "ST_ISSIMPLE",
  "ST_ISVALID",
  "ST_LATFROMGEOHASH",
  "ST_LATITUDE",
  "ST_LENGTH",
  "ST_LINEFROMTEXT",
  "ST_LINEFROMWKB",
  "ST_LINEINTERPOLATEPOINT",
  "ST_LINEINTERPOLATEPOINTS",
  "ST_LONGFROMGEOHASH",
  "ST_LONGITUDE",
  "ST_MAKEENVELOPE",
  "ST_MLINEFROMTEXT",
  "ST_MLINEFROMWKB",
  "ST_MPOINTFROMTEXT",
  "ST_MPOINTFROMWKB",
  "ST_MPOLYFROMTEXT",
  "ST_MPOLYFROMWKB",
  "ST_NUMGEOMETRIES",
  "ST_NUMINTERIORRING",
  "ST_NUMPOINTS",
  "ST_OVERLAPS",
  "ST_POINTATDISTANCE",
  "ST_POINTFROMGEOHASH",
  "ST_POINTFROMTEXT",
  "ST_POINTFROMWKB",
  "ST_POINTN",
  "ST_POLYFROMTEXT",
  "ST_POLYFROMWKB",
  "ST_SIMPLIFY",
  "ST_SRID",
  "ST_STARTPOINT",
  "ST_SWAPXY",
  "ST_SYMDIFFERENCE",
  "ST_TOUCHES",
  "ST_TRANSFORM",
  "ST_UNION",
  "ST_VALIDATE",
  "ST_WITHIN",
  "ST_X",
  "ST_Y",
  "STATEMENT_DIGEST",
  "STATEMENT_DIGEST_TEXT",
  "STD",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STR_TO_DATE",
  "STRCMP",
  "SUBDATE",
  "SUBSTR",
  "SUBSTRING",
  "SUBSTRING_INDEX",
  "SUBTIME",
  "SUM",
  "SYSDATE",
  "SYSTEM_USER",
  "TAN",
  "TIME",
  "TIME_FORMAT",
  "TIME_TO_SEC",
  "TIMEDIFF",
  "TIMESTAMP",
  "TIMESTAMPADD",
  "TIMESTAMPDIFF",
  "TO_BASE64",
  "TO_DAYS",
  "TO_SECONDS",
  "TRIM",
  "TRUNCATE",
  "UCASE",
  "UNCOMPRESS",
  "UNCOMPRESSED_LENGTH",
  "UNHEX",
  "UNIX_TIMESTAMP",
  "UPDATEXML",
  "UPPER",
  // 'USER',
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "UUID",
  "UUID_SHORT",
  "UUID_TO_BIN",
  "VALIDATE_PASSWORD_STRENGTH",
  "VALUES",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  "VERSION",
  "WAIT_FOR_EXECUTED_GTID_SET",
  "WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS",
  "WEEK",
  "WEEKDAY",
  "WEEKOFYEAR",
  "WEIGHT_STRING",
  // 'XOR',
  "YEAR",
  "YEARWEEK"
];

// node_modules/sql-formatter/dist/esm/languages/mysql/mysql.formatter.js
var reservedSelect8 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses8 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]",
  "REPLACE [LOW_PRIORITY | DELAYED] [INTO]",
  "VALUES",
  "ON DUPLICATE KEY UPDATE",
  // - update:
  "SET"
]);
var standardOnelineClauses8 = expandPhrases(["CREATE [TEMPORARY] TABLE [IF NOT EXISTS]"]);
var tabularOnelineClauses8 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE [LOW_PRIORITY] [IGNORE]",
  // - delete:
  "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM",
  // - drop table:
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "{CHANGE | MODIFY} [COLUMN]",
  "DROP [COLUMN]",
  "RENAME [TO | AS]",
  "RENAME COLUMN",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html
  "ALTER DATABASE",
  "ALTER EVENT",
  "ALTER FUNCTION",
  "ALTER INSTANCE",
  "ALTER LOGFILE GROUP",
  "ALTER PROCEDURE",
  "ALTER RESOURCE GROUP",
  "ALTER SERVER",
  "ALTER TABLESPACE",
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE TABLE",
  "BINLOG",
  "CACHE INDEX",
  "CALL",
  "CHANGE MASTER TO",
  "CHANGE REPLICATION FILTER",
  "CHANGE REPLICATION SOURCE TO",
  "CHECK TABLE",
  "CHECKSUM TABLE",
  "CLONE",
  "COMMIT",
  "CREATE DATABASE",
  "CREATE EVENT",
  "CREATE FUNCTION",
  "CREATE FUNCTION",
  "CREATE INDEX",
  "CREATE LOGFILE GROUP",
  "CREATE PROCEDURE",
  "CREATE RESOURCE GROUP",
  "CREATE ROLE",
  "CREATE SERVER",
  "CREATE SPATIAL REFERENCE SYSTEM",
  "CREATE TABLESPACE",
  "CREATE TRIGGER",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DROP DATABASE",
  "DROP EVENT",
  "DROP FUNCTION",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP LOGFILE GROUP",
  "DROP PROCEDURE",
  "DROP RESOURCE GROUP",
  "DROP ROLE",
  "DROP SERVER",
  "DROP SPATIAL REFERENCE SYSTEM",
  "DROP TABLESPACE",
  "DROP TRIGGER",
  "DROP USER",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FLUSH",
  "GRANT",
  "HANDLER",
  "HELP",
  "IMPORT TABLE",
  "INSTALL COMPONENT",
  "INSTALL PLUGIN",
  "KILL",
  "LOAD DATA",
  "LOAD INDEX INTO CACHE",
  "LOAD XML",
  "LOCK INSTANCE FOR BACKUP",
  "LOCK TABLES",
  "MASTER_POS_WAIT",
  "OPTIMIZE TABLE",
  "PREPARE",
  "PURGE BINARY LOGS",
  "RELEASE SAVEPOINT",
  "RENAME TABLE",
  "RENAME USER",
  "REPAIR TABLE",
  "RESET",
  "RESET MASTER",
  "RESET PERSIST",
  "RESET REPLICA",
  "RESET SLAVE",
  "RESTART",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET NAMES",
  "SET PASSWORD",
  "SET RESOURCE GROUP",
  "SET ROLE",
  "SET TRANSACTION",
  "SHOW",
  "SHOW BINARY LOGS",
  "SHOW BINLOG EVENTS",
  "SHOW CHARACTER SET",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE EVENT",
  "SHOW CREATE FUNCTION",
  "SHOW CREATE PROCEDURE",
  "SHOW CREATE TABLE",
  "SHOW CREATE TRIGGER",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW EVENTS",
  "SHOW FUNCTION CODE",
  "SHOW FUNCTION STATUS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PLUGINS",
  "SHOW PRIVILEGES",
  "SHOW PROCEDURE CODE",
  "SHOW PROCEDURE STATUS",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW RELAYLOG EVENTS",
  "SHOW REPLICA STATUS",
  "SHOW REPLICAS",
  "SHOW SLAVE",
  "SHOW SLAVE HOSTS",
  "SHOW STATUS",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW TRIGGERS",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  "SHUTDOWN",
  "SOURCE_POS_WAIT",
  "START GROUP_REPLICATION",
  "START REPLICA",
  "START SLAVE",
  "START TRANSACTION",
  "STOP GROUP_REPLICATION",
  "STOP REPLICA",
  "STOP SLAVE",
  "TABLE",
  "UNINSTALL COMPONENT",
  "UNINSTALL PLUGIN",
  "UNLOCK INSTANCE",
  "UNLOCK TABLES",
  "USE",
  "XA",
  // flow control
  // 'IF',
  "ITERATE",
  "LEAVE",
  "LOOP",
  "REPEAT",
  "RETURN",
  "WHILE"
]);
var reservedSetOperations8 = expandPhrases(["UNION [ALL | DISTINCT]"]);
var reservedJoins8 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedKeywordPhrases7 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL]",
  "CHARACTER SET",
  "{ROWS | RANGE} BETWEEN",
  "IDENTIFIED BY"
]);
var reservedDataTypePhrases7 = expandPhrases([]);
var mysql = {
  name: "mysql",
  tokenizerOptions: {
    reservedSelect: reservedSelect8,
    reservedClauses: [...reservedClauses8, ...standardOnelineClauses8, ...tabularOnelineClauses8],
    reservedSetOperations: reservedSetOperations8,
    reservedJoins: reservedJoins8,
    reservedKeywordPhrases: reservedKeywordPhrases7,
    reservedDataTypePhrases: reservedDataTypePhrases7,
    supportsXor: true,
    reservedKeywords: keywords8,
    reservedDataTypes: dataTypes8,
    reservedFunctionNames: functions8,
    // TODO: support _ char set prefixes such as _utf8, _latin1, _binary, _utf8mb4, etc.
    stringTypes: [
      '""-qq-bs',
      { quote: "''-qq-bs", prefixes: ["N"] },
      { quote: "''-raw", prefixes: ["B", "X"], requirePrefix: true }
    ],
    identTypes: ["``"],
    identChars: { first: "$", rest: "$", allowFirstCharNumber: true },
    variableTypes: [
      { regex: "@@?[A-Za-z0-9_.$]+" },
      { quote: '""-qq-bs', prefixes: ["@"], requirePrefix: true },
      { quote: "''-qq-bs", prefixes: ["@"], requirePrefix: true },
      { quote: "``", prefixes: ["@"], requirePrefix: true }
    ],
    paramTypes: { positional: true },
    lineCommentTypes: ["--", "#"],
    operators: [
      "%",
      ":=",
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      "<=>",
      "->",
      "->>",
      "&&",
      "||",
      "!",
      "*.*"
      // Not actually an operator
    ],
    postProcess: postProcess3
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses8, ...tabularOnelineClauses8],
    tabularOnelineClauses: tabularOnelineClauses8
  }
};

// node_modules/sql-formatter/dist/esm/languages/tidb/tidb.keywords.js
var keywords9 = [
  // https://docs.pingcap.com/tidb/stable/keywords
  "ADD",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "ARRAY",
  "AS",
  "ASC",
  "BETWEEN",
  "BOTH",
  "BY",
  "CALL",
  "CASCADE",
  "CASE",
  "CHANGE",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "CONSTRAINT",
  "CONTINUE",
  "CONVERT",
  "CREATE",
  "CROSS",
  "CURRENT_DATE",
  "CURRENT_ROLE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURSOR",
  "DATABASE",
  "DATABASES",
  "DAY_HOUR",
  "DAY_MICROSECOND",
  "DAY_MINUTE",
  "DAY_SECOND",
  "DEFAULT",
  "DELAYED",
  "DELETE",
  "DESC",
  "DESCRIBE",
  "DISTINCT",
  "DISTINCTROW",
  "DIV",
  "DOUBLE",
  "DROP",
  "DUAL",
  "ELSE",
  "ELSEIF",
  "ENCLOSED",
  "ESCAPED",
  "EXCEPT",
  "EXISTS",
  "EXIT",
  "EXPLAIN",
  "FALSE",
  "FETCH",
  "FOR",
  "FORCE",
  "FOREIGN",
  "FROM",
  "FULLTEXT",
  "GENERATED",
  "GRANT",
  "GROUP",
  "GROUPS",
  "HAVING",
  "HIGH_PRIORITY",
  "HOUR_MICROSECOND",
  "HOUR_MINUTE",
  "HOUR_SECOND",
  "IF",
  "IGNORE",
  "ILIKE",
  "IN",
  "INDEX",
  "INFILE",
  "INNER",
  "INOUT",
  "INSERT",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "IS",
  "ITERATE",
  "JOIN",
  "KEY",
  "KEYS",
  "KILL",
  "LEADING",
  "LEAVE",
  "LEFT",
  "LIKE",
  "LIMIT",
  "LINEAR",
  "LINES",
  "LOAD",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCK",
  "LONG",
  "LOW_PRIORITY",
  "MATCH",
  "MAXVALUE",
  "MINUTE_MICROSECOND",
  "MINUTE_SECOND",
  "MOD",
  "NATURAL",
  "NOT",
  "NO_WRITE_TO_BINLOG",
  "NULL",
  "OF",
  "ON",
  "OPTIMIZE",
  "OPTION",
  "OPTIONALLY",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OUTFILE",
  "OVER",
  "PARTITION",
  "PRIMARY",
  "PROCEDURE",
  "RANGE",
  "READ",
  "RECURSIVE",
  "REFERENCES",
  "REGEXP",
  "RELEASE",
  "RENAME",
  "REPEAT",
  "REPLACE",
  "REQUIRE",
  "RESTRICT",
  "REVOKE",
  "RIGHT",
  "RLIKE",
  "ROW",
  "ROWS",
  "SECOND_MICROSECOND",
  "SELECT",
  "SET",
  "SHOW",
  "SPATIAL",
  "SQL",
  "SQLEXCEPTION",
  "SQLSTATE",
  "SQLWARNING",
  "SQL_BIG_RESULT",
  "SQL_CALC_FOUND_ROWS",
  "SQL_SMALL_RESULT",
  "SSL",
  "STARTING",
  "STATS_EXTENDED",
  "STORED",
  "STRAIGHT_JOIN",
  "TABLE",
  "TABLESAMPLE",
  "TERMINATED",
  "THEN",
  "TO",
  "TRAILING",
  "TRIGGER",
  "TRUE",
  "TiDB_CURRENT_TSO",
  "UNION",
  "UNIQUE",
  "UNLOCK",
  "UNSIGNED",
  "UNTIL",
  "UPDATE",
  "USAGE",
  "USE",
  "USING",
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "VALUES",
  "VIRTUAL",
  "WHEN",
  "WHERE",
  "WHILE",
  "WINDOW",
  "WITH",
  "WRITE",
  "XOR",
  "YEAR_MONTH",
  "ZEROFILL"
  // (R)
];
var dataTypes9 = [
  // https://docs.pingcap.com/tidb/stable/data-type-overview
  "BIGINT",
  "BINARY",
  "BIT",
  "BLOB",
  "BOOL",
  "BOOLEAN",
  "CHAR",
  "CHARACTER",
  "DATE",
  "DATETIME",
  "DEC",
  "DECIMAL",
  "DOUBLE PRECISION",
  "DOUBLE",
  "ENUM",
  "FIXED",
  "INT",
  "INT1",
  "INT2",
  "INT3",
  "INT4",
  "INT8",
  "INTEGER",
  "LONGBLOB",
  "LONGTEXT",
  "MEDIUMBLOB",
  "MEDIUMINT",
  "MIDDLEINT",
  "NATIONAL CHAR",
  "NATIONAL VARCHAR",
  "NUMERIC",
  "PRECISION",
  "SMALLINT",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "TINYBLOB",
  "TINYINT",
  "TINYTEXT",
  "VARBINARY",
  "VARCHAR",
  "VARCHARACTER",
  "VARYING",
  "YEAR"
  // 'SET' // handled as special-case in postProcess
];

// node_modules/sql-formatter/dist/esm/languages/tidb/tidb.functions.js
var functions9 = [
  // https://docs.pingcap.com/tidb/stable/sql-statement-show-builtins
  // https://docs.pingcap.com/tidb/stable/functions-and-operators-overview
  // + MySQL aggregate functions: https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html
  // + MySQL window functions: https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html
  "ABS",
  "ACOS",
  "ADDDATE",
  "ADDTIME",
  "AES_DECRYPT",
  "AES_ENCRYPT",
  // 'AND',
  "ANY_VALUE",
  "ASCII",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AVG",
  "BENCHMARK",
  "BIN",
  "BIN_TO_UUID",
  "BIT_AND",
  "BIT_COUNT",
  "BIT_LENGTH",
  "BIT_OR",
  "BIT_XOR",
  "BITAND",
  "BITNEG",
  "BITOR",
  "BITXOR",
  "CASE",
  "CAST",
  "CEIL",
  "CEILING",
  "CHAR_FUNC",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "CHARSET",
  "COALESCE",
  "COERCIBILITY",
  "COLLATION",
  "COMPRESS",
  "CONCAT",
  "CONCAT_WS",
  "CONNECTION_ID",
  "CONV",
  "CONVERT",
  "CONVERT_TZ",
  "COS",
  "COT",
  "COUNT",
  "CRC32",
  "CUME_DIST",
  "CURDATE",
  "CURRENT_DATE",
  "CURRENT_RESOURCE_GROUP",
  "CURRENT_ROLE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURTIME",
  "DATABASE",
  "DATE",
  "DATE_ADD",
  "DATE_FORMAT",
  "DATE_SUB",
  "DATEDIFF",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DECODE",
  "DEFAULT_FUNC",
  "DEGREES",
  "DENSE_RANK",
  "DES_DECRYPT",
  "DES_ENCRYPT",
  "DIV",
  "ELT",
  "ENCODE",
  "ENCRYPT",
  "EQ",
  "EXP",
  "EXPORT_SET",
  "EXTRACT",
  "FIELD",
  "FIND_IN_SET",
  "FIRST_VALUE",
  "FLOOR",
  "FORMAT",
  "FORMAT_BYTES",
  "FORMAT_NANO_TIME",
  "FOUND_ROWS",
  "FROM_BASE64",
  "FROM_DAYS",
  "FROM_UNIXTIME",
  "GE",
  "GET_FORMAT",
  "GET_LOCK",
  "GETPARAM",
  "GREATEST",
  "GROUP_CONCAT",
  "GROUPING",
  "GT",
  "HEX",
  "HOUR",
  "IF",
  "IFNULL",
  "ILIKE",
  // 'IN',
  "INET6_ATON",
  "INET6_NTOA",
  "INET_ATON",
  "INET_NTOA",
  "INSERT_FUNC",
  "INSTR",
  "INTDIV",
  "INTERVAL",
  "IS_FREE_LOCK",
  "IS_IPV4",
  "IS_IPV4_COMPAT",
  "IS_IPV4_MAPPED",
  "IS_IPV6",
  "IS_USED_LOCK",
  "IS_UUID",
  "ISFALSE",
  "ISNULL",
  "ISTRUE",
  "JSON_ARRAY",
  "JSON_ARRAYAGG",
  "JSON_ARRAY_APPEND",
  "JSON_ARRAY_INSERT",
  "JSON_CONTAINS",
  "JSON_CONTAINS_PATH",
  "JSON_DEPTH",
  "JSON_EXTRACT",
  "JSON_INSERT",
  "JSON_KEYS",
  "JSON_LENGTH",
  "JSON_MEMBEROF",
  "JSON_MERGE",
  "JSON_MERGE_PATCH",
  "JSON_MERGE_PRESERVE",
  "JSON_OBJECT",
  "JSON_OBJECTAGG",
  "JSON_OVERLAPS",
  "JSON_PRETTY",
  "JSON_QUOTE",
  "JSON_REMOVE",
  "JSON_REPLACE",
  "JSON_SEARCH",
  "JSON_SET",
  "JSON_STORAGE_FREE",
  "JSON_STORAGE_SIZE",
  "JSON_TYPE",
  "JSON_UNQUOTE",
  "JSON_VALID",
  "LAG",
  "LAST_DAY",
  "LAST_INSERT_ID",
  "LAST_VALUE",
  "LASTVAL",
  "LCASE",
  "LE",
  "LEAD",
  "LEAST",
  "LEFT",
  "LEFTSHIFT",
  "LENGTH",
  "LIKE",
  "LN",
  "LOAD_FILE",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCATE",
  "LOG",
  "LOG10",
  "LOG2",
  "LOWER",
  "LPAD",
  "LT",
  "LTRIM",
  "MAKE_SET",
  "MAKEDATE",
  "MAKETIME",
  "MASTER_POS_WAIT",
  "MAX",
  "MD5",
  "MICROSECOND",
  "MID",
  "MIN",
  "MINUS",
  "MINUTE",
  "MOD",
  "MONTH",
  "MONTHNAME",
  "MUL",
  "NAME_CONST",
  "NE",
  "NEXTVAL",
  "NOT",
  "NOW",
  "NTH_VALUE",
  "NTILE",
  "NULLEQ",
  "OCT",
  "OCTET_LENGTH",
  "OLD_PASSWORD",
  // 'OR',
  "ORD",
  "PASSWORD_FUNC",
  "PERCENT_RANK",
  "PERIOD_ADD",
  "PERIOD_DIFF",
  "PI",
  "PLUS",
  "POSITION",
  "POW",
  "POWER",
  "QUARTER",
  "QUOTE",
  "RADIANS",
  "RAND",
  "RANDOM_BYTES",
  "RANK",
  "REGEXP",
  "REGEXP_INSTR",
  "REGEXP_LIKE",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "RELEASE_ALL_LOCKS",
  "RELEASE_LOCK",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "RIGHT",
  "RIGHTSHIFT",
  "ROUND",
  "ROW_COUNT",
  "ROW_NUMBER",
  "RPAD",
  "RTRIM",
  "SCHEMA",
  "SEC_TO_TIME",
  "SECOND",
  "SESSION_USER",
  "SETVAL",
  "SETVAR",
  "SHA",
  "SHA1",
  "SHA2",
  "SIGN",
  "SIN",
  "SLEEP",
  "SM3",
  "SPACE",
  "SQRT",
  "STD",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STR_TO_DATE",
  "STRCMP",
  "SUBDATE",
  "SUBSTR",
  "SUBSTRING",
  "SUBSTRING_INDEX",
  "SUBTIME",
  "SUM",
  "SYSDATE",
  "SYSTEM_USER",
  "TAN",
  "TIDB_BOUNDED_STALENESS",
  "TIDB_CURRENT_TSO",
  "TIDB_DECODE_BINARY_PLAN",
  "TIDB_DECODE_KEY",
  "TIDB_DECODE_PLAN",
  "TIDB_DECODE_SQL_DIGESTS",
  "TIDB_ENCODE_SQL_DIGEST",
  "TIDB_IS_DDL_OWNER",
  "TIDB_PARSE_TSO",
  "TIDB_PARSE_TSO_LOGICAL",
  "TIDB_ROW_CHECKSUM",
  "TIDB_SHARD",
  "TIDB_VERSION",
  "TIME",
  "TIME_FORMAT",
  "TIME_TO_SEC",
  "TIMEDIFF",
  "TIMESTAMP",
  "TIMESTAMPADD",
  "TIMESTAMPDIFF",
  "TO_BASE64",
  "TO_DAYS",
  "TO_SECONDS",
  "TRANSLATE",
  "TRIM",
  "TRUNCATE",
  "UCASE",
  "UNARYMINUS",
  "UNCOMPRESS",
  "UNCOMPRESSED_LENGTH",
  "UNHEX",
  "UNIX_TIMESTAMP",
  "UPPER",
  // 'USER',
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "UUID",
  "UUID_SHORT",
  "UUID_TO_BIN",
  "VALIDATE_PASSWORD_STRENGTH",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  "VERSION",
  "VITESS_HASH",
  "WEEK",
  "WEEKDAY",
  "WEEKOFYEAR",
  "WEIGHT_STRING",
  // 'XOR',
  "YEAR",
  "YEARWEEK"
];

// node_modules/sql-formatter/dist/esm/languages/tidb/tidb.formatter.js
var reservedSelect9 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses9 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]",
  "REPLACE [LOW_PRIORITY | DELAYED] [INTO]",
  "VALUES",
  "ON DUPLICATE KEY UPDATE",
  // - update:
  "SET"
]);
var standardOnelineClauses9 = expandPhrases(["CREATE [TEMPORARY] TABLE [IF NOT EXISTS]"]);
var tabularOnelineClauses9 = expandPhrases([
  // https://docs.pingcap.com/tidb/stable/sql-statement-create-view
  "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]",
  // https://docs.pingcap.com/tidb/stable/sql-statement-update
  "UPDATE [LOW_PRIORITY] [IGNORE]",
  // https://docs.pingcap.com/tidb/stable/sql-statement-delete
  "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM",
  // https://docs.pingcap.com/tidb/stable/sql-statement-drop-table
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // https://docs.pingcap.com/tidb/stable/sql-statement-alter-table
  "ALTER TABLE",
  "ADD [COLUMN]",
  "{CHANGE | MODIFY} [COLUMN]",
  "DROP [COLUMN]",
  "RENAME [TO | AS]",
  "RENAME COLUMN",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  // https://docs.pingcap.com/tidb/stable/sql-statement-truncate
  "TRUNCATE [TABLE]",
  // https://docs.pingcap.com/tidb/stable/sql-statement-alter-database
  "ALTER DATABASE",
  // https://docs.pingcap.com/tidb/stable/sql-statement-alter-instance
  "ALTER INSTANCE",
  "ALTER RESOURCE GROUP",
  "ALTER SEQUENCE",
  // https://docs.pingcap.com/tidb/stable/sql-statement-alter-user
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE TABLE",
  "CHECK TABLE",
  "CHECKSUM TABLE",
  "COMMIT",
  "CREATE DATABASE",
  "CREATE INDEX",
  "CREATE RESOURCE GROUP",
  "CREATE ROLE",
  "CREATE SEQUENCE",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DROP DATABASE",
  "DROP INDEX",
  "DROP RESOURCE GROUP",
  "DROP ROLE",
  "DROP TABLESPACE",
  "DROP USER",
  "DROP VIEW",
  "EXPLAIN",
  "FLUSH",
  // https://docs.pingcap.com/tidb/stable/sql-statement-grant-privileges
  "GRANT",
  "IMPORT TABLE",
  "INSTALL COMPONENT",
  "INSTALL PLUGIN",
  "KILL",
  "LOAD DATA",
  "LOCK INSTANCE FOR BACKUP",
  "LOCK TABLES",
  "OPTIMIZE TABLE",
  "PREPARE",
  "RELEASE SAVEPOINT",
  "RENAME TABLE",
  "RENAME USER",
  "REPAIR TABLE",
  "RESET",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET NAMES",
  "SET PASSWORD",
  "SET RESOURCE GROUP",
  "SET ROLE",
  "SET TRANSACTION",
  "SHOW",
  "SHOW BINARY LOGS",
  "SHOW BINLOG EVENTS",
  "SHOW CHARACTER SET",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE TABLE",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW EVENTS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PLUGINS",
  "SHOW PRIVILEGES",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW STATUS",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW TRIGGERS",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  // https://docs.pingcap.com/tidb/stable/sql-statement-table
  "TABLE",
  "UNINSTALL COMPONENT",
  "UNINSTALL PLUGIN",
  "UNLOCK INSTANCE",
  "UNLOCK TABLES",
  // https://docs.pingcap.com/tidb/stable/sql-statement-use
  "USE"
]);
var reservedSetOperations9 = expandPhrases(["UNION [ALL | DISTINCT]"]);
var reservedJoins9 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedKeywordPhrases8 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL]",
  "CHARACTER SET",
  "{ROWS | RANGE} BETWEEN",
  "IDENTIFIED BY"
]);
var reservedDataTypePhrases8 = expandPhrases([]);
var tidb = {
  name: "tidb",
  tokenizerOptions: {
    reservedSelect: reservedSelect9,
    reservedClauses: [...reservedClauses9, ...standardOnelineClauses9, ...tabularOnelineClauses9],
    reservedSetOperations: reservedSetOperations9,
    reservedJoins: reservedJoins9,
    reservedKeywordPhrases: reservedKeywordPhrases8,
    reservedDataTypePhrases: reservedDataTypePhrases8,
    supportsXor: true,
    reservedKeywords: keywords9,
    reservedDataTypes: dataTypes9,
    reservedFunctionNames: functions9,
    // TODO: support _ char set prefixes such as _utf8, _latin1, _binary, _utf8mb4, etc.
    stringTypes: [
      '""-qq-bs',
      { quote: "''-qq-bs", prefixes: ["N"] },
      { quote: "''-raw", prefixes: ["B", "X"], requirePrefix: true }
    ],
    identTypes: ["``"],
    identChars: { first: "$", rest: "$", allowFirstCharNumber: true },
    variableTypes: [
      { regex: "@@?[A-Za-z0-9_.$]+" },
      { quote: '""-qq-bs', prefixes: ["@"], requirePrefix: true },
      { quote: "''-qq-bs", prefixes: ["@"], requirePrefix: true },
      { quote: "``", prefixes: ["@"], requirePrefix: true }
    ],
    paramTypes: { positional: true },
    lineCommentTypes: ["--", "#"],
    operators: [
      "%",
      ":=",
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      "<=>",
      "->",
      "->>",
      "&&",
      "||",
      "!",
      "*.*"
      // Not actually an operator
    ],
    postProcess: postProcess3
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses9, ...tabularOnelineClauses9],
    tabularOnelineClauses: tabularOnelineClauses9
  }
};

// node_modules/sql-formatter/dist/esm/languages/n1ql/n1ql.functions.js
var functions10 = [
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/functions.html
  "ABORT",
  "ABS",
  "ACOS",
  "ADVISOR",
  "ARRAY_AGG",
  "ARRAY_AGG",
  "ARRAY_APPEND",
  "ARRAY_AVG",
  "ARRAY_BINARY_SEARCH",
  "ARRAY_CONCAT",
  "ARRAY_CONTAINS",
  "ARRAY_COUNT",
  "ARRAY_DISTINCT",
  "ARRAY_EXCEPT",
  "ARRAY_FLATTEN",
  "ARRAY_IFNULL",
  "ARRAY_INSERT",
  "ARRAY_INTERSECT",
  "ARRAY_LENGTH",
  "ARRAY_MAX",
  "ARRAY_MIN",
  "ARRAY_MOVE",
  "ARRAY_POSITION",
  "ARRAY_PREPEND",
  "ARRAY_PUT",
  "ARRAY_RANGE",
  "ARRAY_REMOVE",
  "ARRAY_REPEAT",
  "ARRAY_REPLACE",
  "ARRAY_REVERSE",
  "ARRAY_SORT",
  "ARRAY_STAR",
  "ARRAY_SUM",
  "ARRAY_SYMDIFF",
  "ARRAY_SYMDIFF1",
  "ARRAY_SYMDIFFN",
  "ARRAY_UNION",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AVG",
  "BASE64",
  "BASE64_DECODE",
  "BASE64_ENCODE",
  "BITAND ",
  "BITCLEAR ",
  "BITNOT ",
  "BITOR ",
  "BITSET ",
  "BITSHIFT ",
  "BITTEST ",
  "BITXOR ",
  "CEIL",
  "CLOCK_LOCAL",
  "CLOCK_MILLIS",
  "CLOCK_STR",
  "CLOCK_TZ",
  "CLOCK_UTC",
  "COALESCE",
  "CONCAT",
  "CONCAT2",
  "CONTAINS",
  "CONTAINS_TOKEN",
  "CONTAINS_TOKEN_LIKE",
  "CONTAINS_TOKEN_REGEXP",
  "COS",
  "COUNT",
  "COUNT",
  "COUNTN",
  "CUME_DIST",
  "CURL",
  "DATE_ADD_MILLIS",
  "DATE_ADD_STR",
  "DATE_DIFF_MILLIS",
  "DATE_DIFF_STR",
  "DATE_FORMAT_STR",
  "DATE_PART_MILLIS",
  "DATE_PART_STR",
  "DATE_RANGE_MILLIS",
  "DATE_RANGE_STR",
  "DATE_TRUNC_MILLIS",
  "DATE_TRUNC_STR",
  "DECODE",
  "DECODE_JSON",
  "DEGREES",
  "DENSE_RANK",
  "DURATION_TO_STR",
  // 'E',
  "ENCODED_SIZE",
  "ENCODE_JSON",
  "EXP",
  "FIRST_VALUE",
  "FLOOR",
  "GREATEST",
  "HAS_TOKEN",
  "IFINF",
  "IFMISSING",
  "IFMISSINGORNULL",
  "IFNAN",
  "IFNANORINF",
  "IFNULL",
  "INITCAP",
  "ISARRAY",
  "ISATOM",
  "ISBITSET",
  "ISBOOLEAN",
  "ISNUMBER",
  "ISOBJECT",
  "ISSTRING",
  "LAG",
  "LAST_VALUE",
  "LEAD",
  "LEAST",
  "LENGTH",
  "LN",
  "LOG",
  "LOWER",
  "LTRIM",
  "MAX",
  "MEAN",
  "MEDIAN",
  "META",
  "MILLIS",
  "MILLIS_TO_LOCAL",
  "MILLIS_TO_STR",
  "MILLIS_TO_TZ",
  "MILLIS_TO_UTC",
  "MILLIS_TO_ZONE_NAME",
  "MIN",
  "MISSINGIF",
  "NANIF",
  "NEGINFIF",
  "NOW_LOCAL",
  "NOW_MILLIS",
  "NOW_STR",
  "NOW_TZ",
  "NOW_UTC",
  "NTH_VALUE",
  "NTILE",
  "NULLIF",
  "NVL",
  "NVL2",
  "OBJECT_ADD",
  "OBJECT_CONCAT",
  "OBJECT_INNER_PAIRS",
  "OBJECT_INNER_VALUES",
  "OBJECT_LENGTH",
  "OBJECT_NAMES",
  "OBJECT_PAIRS",
  "OBJECT_PUT",
  "OBJECT_REMOVE",
  "OBJECT_RENAME",
  "OBJECT_REPLACE",
  "OBJECT_UNWRAP",
  "OBJECT_VALUES",
  "PAIRS",
  "PERCENT_RANK",
  "PI",
  "POLY_LENGTH",
  "POSINFIF",
  "POSITION",
  "POWER",
  "RADIANS",
  "RANDOM",
  "RANK",
  "RATIO_TO_REPORT",
  "REGEXP_CONTAINS",
  "REGEXP_LIKE",
  "REGEXP_MATCHES",
  "REGEXP_POSITION",
  "REGEXP_REPLACE",
  "REGEXP_SPLIT",
  "REGEX_CONTAINS",
  "REGEX_LIKE",
  "REGEX_MATCHES",
  "REGEX_POSITION",
  "REGEX_REPLACE",
  "REGEX_SPLIT",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "ROUND",
  "ROW_NUMBER",
  "RTRIM",
  "SEARCH",
  "SEARCH_META",
  "SEARCH_SCORE",
  "SIGN",
  "SIN",
  "SPLIT",
  "SQRT",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STR_TO_DURATION",
  "STR_TO_MILLIS",
  "STR_TO_TZ",
  "STR_TO_UTC",
  "STR_TO_ZONE_NAME",
  "SUBSTR",
  "SUFFIXES",
  "SUM",
  "TAN",
  "TITLE",
  "TOARRAY",
  "TOATOM",
  "TOBOOLEAN",
  "TOKENS",
  "TOKENS",
  "TONUMBER",
  "TOOBJECT",
  "TOSTRING",
  "TRIM",
  "TRUNC",
  // 'TYPE', // disabled
  "UPPER",
  "UUID",
  "VARIANCE",
  "VARIANCE_POP",
  "VARIANCE_SAMP",
  "VAR_POP",
  "VAR_SAMP",
  "WEEKDAY_MILLIS",
  "WEEKDAY_STR",
  // type casting
  // not implemented in N1QL, but added here now for the sake of tests
  // https://docs.couchbase.com/server/current/analytics/3_query.html#Vs_SQL-92
  "CAST"
];

// node_modules/sql-formatter/dist/esm/languages/n1ql/n1ql.keywords.js
var keywords10 = [
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html
  "ADVISE",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "ANY",
  "ARRAY",
  "AS",
  "ASC",
  "AT",
  "BEGIN",
  "BETWEEN",
  "BINARY",
  "BOOLEAN",
  "BREAK",
  "BUCKET",
  "BUILD",
  "BY",
  "CALL",
  "CASE",
  "CAST",
  "CLUSTER",
  "COLLATE",
  "COLLECTION",
  "COMMIT",
  "COMMITTED",
  "CONNECT",
  "CONTINUE",
  "CORRELATED",
  "COVER",
  "CREATE",
  "CURRENT",
  "DATABASE",
  "DATASET",
  "DATASTORE",
  "DECLARE",
  "DECREMENT",
  "DELETE",
  "DERIVED",
  "DESC",
  "DESCRIBE",
  "DISTINCT",
  "DO",
  "DROP",
  "EACH",
  "ELEMENT",
  "ELSE",
  "END",
  "EVERY",
  "EXCEPT",
  "EXCLUDE",
  "EXECUTE",
  "EXISTS",
  "EXPLAIN",
  "FALSE",
  "FETCH",
  "FILTER",
  "FIRST",
  "FLATTEN",
  "FLUSH",
  "FOLLOWING",
  "FOR",
  "FORCE",
  "FROM",
  "FTS",
  "FUNCTION",
  "GOLANG",
  "GRANT",
  "GROUP",
  "GROUPS",
  "GSI",
  "HASH",
  "HAVING",
  "IF",
  "IGNORE",
  "ILIKE",
  "IN",
  "INCLUDE",
  "INCREMENT",
  "INDEX",
  "INFER",
  "INLINE",
  "INNER",
  "INSERT",
  "INTERSECT",
  "INTO",
  "IS",
  "ISOLATION",
  "JAVASCRIPT",
  "JOIN",
  "KEY",
  "KEYS",
  "KEYSPACE",
  "KNOWN",
  "LANGUAGE",
  "LAST",
  "LEFT",
  "LET",
  "LETTING",
  "LEVEL",
  "LIKE",
  "LIMIT",
  "LSM",
  "MAP",
  "MAPPING",
  "MATCHED",
  "MATERIALIZED",
  "MERGE",
  "MINUS",
  "MISSING",
  "NAMESPACE",
  "NEST",
  "NL",
  "NO",
  "NOT",
  "NTH_VALUE",
  "NULL",
  "NULLS",
  "NUMBER",
  "OBJECT",
  "OFFSET",
  "ON",
  "OPTION",
  "OPTIONS",
  "OR",
  "ORDER",
  "OTHERS",
  "OUTER",
  "OVER",
  "PARSE",
  "PARTITION",
  "PASSWORD",
  "PATH",
  "POOL",
  "PRECEDING",
  "PREPARE",
  "PRIMARY",
  "PRIVATE",
  "PRIVILEGE",
  "PROBE",
  "PROCEDURE",
  "PUBLIC",
  "RANGE",
  "RAW",
  "REALM",
  "REDUCE",
  "RENAME",
  "RESPECT",
  "RETURN",
  "RETURNING",
  "REVOKE",
  "RIGHT",
  "ROLE",
  "ROLLBACK",
  "ROW",
  "ROWS",
  "SATISFIES",
  "SAVEPOINT",
  "SCHEMA",
  "SCOPE",
  "SELECT",
  "SELF",
  "SEMI",
  "SET",
  "SHOW",
  "SOME",
  "START",
  "STATISTICS",
  "STRING",
  "SYSTEM",
  "THEN",
  "TIES",
  "TO",
  "TRAN",
  "TRANSACTION",
  "TRIGGER",
  "TRUE",
  "TRUNCATE",
  "UNBOUNDED",
  "UNDER",
  "UNION",
  "UNIQUE",
  "UNKNOWN",
  "UNNEST",
  "UNSET",
  "UPDATE",
  "UPSERT",
  "USE",
  "USER",
  "USING",
  "VALIDATE",
  "VALUE",
  "VALUED",
  "VALUES",
  "VIA",
  "VIEW",
  "WHEN",
  "WHERE",
  "WHILE",
  "WINDOW",
  "WITH",
  "WITHIN",
  "WORK",
  "XOR"
];
var dataTypes10 = [
  // N1QL does not support any way of declaring types for columns.
  // It does not support the CREATE TABLE statement nor the CAST() expression.
  //
  // It does have several keywords like ARRAY and OBJECT, which seem to refer to types,
  // but they are used as operators. It also reserves several words like STRING and NUMBER,
  // which it actually doesn't use.
  //
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/datatypes.html
];

// node_modules/sql-formatter/dist/esm/languages/n1ql/n1ql.formatter.js
var reservedSelect10 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses10 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED THEN",
  "UPDATE SET",
  "INSERT",
  // other
  "NEST",
  "UNNEST",
  "RETURNING"
]);
var onelineClauses = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - set schema:
  "SET SCHEMA",
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html
  "ADVISE",
  "ALTER INDEX",
  "BEGIN TRANSACTION",
  "BUILD INDEX",
  "COMMIT TRANSACTION",
  "CREATE COLLECTION",
  "CREATE FUNCTION",
  "CREATE INDEX",
  "CREATE PRIMARY INDEX",
  "CREATE SCOPE",
  "DROP COLLECTION",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP PRIMARY INDEX",
  "DROP SCOPE",
  "EXECUTE",
  "EXECUTE FUNCTION",
  "EXPLAIN",
  "GRANT",
  "INFER",
  "PREPARE",
  "REVOKE",
  "ROLLBACK TRANSACTION",
  "SAVEPOINT",
  "SET TRANSACTION",
  "UPDATE STATISTICS",
  "UPSERT",
  // other
  "LET",
  "SET CURRENT SCHEMA",
  "SHOW",
  "USE [PRIMARY] KEYS"
]);
var reservedSetOperations10 = expandPhrases(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"]);
var reservedJoins10 = expandPhrases(["JOIN", "{LEFT | RIGHT} [OUTER] JOIN", "INNER JOIN"]);
var reservedKeywordPhrases9 = expandPhrases(["{ROWS | RANGE | GROUPS} BETWEEN"]);
var reservedDataTypePhrases9 = expandPhrases([]);
var n1ql = {
  name: "n1ql",
  tokenizerOptions: {
    reservedSelect: reservedSelect10,
    reservedClauses: [...reservedClauses10, ...onelineClauses],
    reservedSetOperations: reservedSetOperations10,
    reservedJoins: reservedJoins10,
    reservedKeywordPhrases: reservedKeywordPhrases9,
    reservedDataTypePhrases: reservedDataTypePhrases9,
    supportsXor: true,
    reservedKeywords: keywords10,
    reservedDataTypes: dataTypes10,
    reservedFunctionNames: functions10,
    // NOTE: single quotes are actually not supported in N1QL,
    // but we support them anyway as all other SQL dialects do,
    // which simplifies writing tests that are shared between all dialects.
    stringTypes: ['""-bs', "''-bs"],
    identTypes: ["``"],
    extraParens: ["[]", "{}"],
    paramTypes: { positional: true, numbered: ["$"], named: ["$"] },
    lineCommentTypes: ["#", "--"],
    operators: ["%", "==", ":", "||"]
  },
  formatOptions: {
    onelineClauses
  }
};

// node_modules/sql-formatter/dist/esm/languages/plsql/plsql.keywords.js
var keywords11 = [
  // https://docs.oracle.com/cd/B19306_01/appdev.102/b14261/reservewords.htm
  // 'A',
  "ADD",
  "AGENT",
  "AGGREGATE",
  "ALL",
  "ALTER",
  "AND",
  "ANY",
  "ARROW",
  "AS",
  "ASC",
  "AT",
  "ATTRIBUTE",
  "AUTHID",
  "AVG",
  "BEGIN",
  "BETWEEN",
  "BLOCK",
  "BODY",
  "BOTH",
  "BOUND",
  "BULK",
  "BY",
  "BYTE",
  // 'C',
  "CALL",
  "CALLING",
  "CASCADE",
  "CASE",
  "CHARSET",
  "CHARSETFORM",
  "CHARSETID",
  "CHECK",
  "CLOSE",
  "CLUSTER",
  "CLUSTERS",
  "COLAUTH",
  "COLLECT",
  "COLUMNS",
  "COMMENT",
  "COMMIT",
  "COMMITTED",
  "COMPILED",
  "COMPRESS",
  "CONNECT",
  "CONSTANT",
  "CONSTRUCTOR",
  "CONTEXT",
  "CONVERT",
  "COUNT",
  "CRASH",
  "CREATE",
  "CURRENT",
  "CURSOR",
  "CUSTOMDATUM",
  "DANGLING",
  "DATA",
  "DAY",
  "DECLARE",
  "DEFAULT",
  "DEFINE",
  "DELETE",
  "DESC",
  "DETERMINISTIC",
  "DISTINCT",
  "DROP",
  "DURATION",
  "ELEMENT",
  "ELSE",
  "ELSIF",
  "EMPTY",
  "END",
  "ESCAPE",
  "EXCEPT",
  "EXCEPTION",
  "EXCEPTIONS",
  "EXCLUSIVE",
  "EXECUTE",
  "EXISTS",
  "EXIT",
  "EXTERNAL",
  "FETCH",
  "FINAL",
  "FIXED",
  "FOR",
  "FORALL",
  "FORCE",
  "FORM",
  "FROM",
  "FUNCTION",
  "GENERAL",
  "GOTO",
  "GRANT",
  "GROUP",
  "HASH",
  "HAVING",
  "HEAP",
  "HIDDEN",
  "HOUR",
  "IDENTIFIED",
  "IF",
  "IMMEDIATE",
  "IN",
  "INCLUDING",
  "INDEX",
  "INDEXES",
  "INDICATOR",
  "INDICES",
  "INFINITE",
  "INSERT",
  "INSTANTIABLE",
  "INTERFACE",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "INVALIDATE",
  "IS",
  "ISOLATION",
  "JAVA",
  "LANGUAGE",
  "LARGE",
  "LEADING",
  "LENGTH",
  "LEVEL",
  "LIBRARY",
  "LIKE",
  "LIKE2",
  "LIKE4",
  "LIKEC",
  "LIMIT",
  "LIMITED",
  "LOCAL",
  "LOCK",
  "LOOP",
  "MAP",
  "MAX",
  "MAXLEN",
  "MEMBER",
  "MERGE",
  "MIN",
  "MINUS",
  "MINUTE",
  "MOD",
  "MODE",
  "MODIFY",
  "MONTH",
  "MULTISET",
  "NAME",
  "NAN",
  "NATIONAL",
  "NATIVE",
  "NEW",
  "NOCOMPRESS",
  "NOCOPY",
  "NOT",
  "NOWAIT",
  "NULL",
  "OBJECT",
  "OCICOLL",
  "OCIDATE",
  "OCIDATETIME",
  "OCIDURATION",
  "OCIINTERVAL",
  "OCILOBLOCATOR",
  "OCINUMBER",
  "OCIRAW",
  "OCIREF",
  "OCIREFCURSOR",
  "OCIROWID",
  "OCISTRING",
  "OCITYPE",
  "OF",
  "ON",
  "ONLY",
  "OPAQUE",
  "OPEN",
  "OPERATOR",
  "OPTION",
  "OR",
  "ORACLE",
  "ORADATA",
  "ORDER",
  "OVERLAPS",
  "ORGANIZATION",
  "ORLANY",
  "ORLVARY",
  "OTHERS",
  "OUT",
  "OVERRIDING",
  "PACKAGE",
  "PARALLEL_ENABLE",
  "PARAMETER",
  "PARAMETERS",
  "PARTITION",
  "PASCAL",
  "PIPE",
  "PIPELINED",
  "PRAGMA",
  "PRIOR",
  "PRIVATE",
  "PROCEDURE",
  "PUBLIC",
  "RAISE",
  "RANGE",
  "READ",
  "RECORD",
  "REF",
  "REFERENCE",
  "REM",
  "REMAINDER",
  "RENAME",
  "RESOURCE",
  "RESULT",
  "RETURN",
  "RETURNING",
  "REVERSE",
  "REVOKE",
  "ROLLBACK",
  "ROW",
  "SAMPLE",
  "SAVE",
  "SAVEPOINT",
  "SB1",
  "SB2",
  "SB4",
  "SECOND",
  "SEGMENT",
  "SELECT",
  "SELF",
  "SEPARATE",
  "SEQUENCE",
  "SERIALIZABLE",
  "SET",
  "SHARE",
  "SHORT",
  "SIZE",
  "SIZE_T",
  "SOME",
  "SPARSE",
  "SQL",
  "SQLCODE",
  "SQLDATA",
  "SQLNAME",
  "SQLSTATE",
  "STANDARD",
  "START",
  "STATIC",
  "STDDEV",
  "STORED",
  "STRING",
  "STRUCT",
  "STYLE",
  "SUBMULTISET",
  "SUBPARTITION",
  "SUBSTITUTABLE",
  "SUBTYPE",
  "SUM",
  "SYNONYM",
  "TABAUTH",
  "TABLE",
  "TDO",
  "THE",
  "THEN",
  "TIME",
  "TIMEZONE_ABBR",
  "TIMEZONE_HOUR",
  "TIMEZONE_MINUTE",
  "TIMEZONE_REGION",
  "TO",
  "TRAILING",
  "TRANSAC",
  "TRANSACTIONAL",
  "TRUSTED",
  "TYPE",
  "UB1",
  "UB2",
  "UB4",
  "UNDER",
  "UNION",
  "UNIQUE",
  "UNSIGNED",
  "UNTRUSTED",
  "UPDATE",
  "USE",
  "USING",
  "VALIST",
  "VALUE",
  "VALUES",
  "VARIABLE",
  "VARIANCE",
  "VARRAY",
  "VIEW",
  "VIEWS",
  "VOID",
  "WHEN",
  "WHERE",
  "WHILE",
  "WITH",
  "WORK",
  "WRAPPED",
  "WRITE",
  "YEAR",
  "ZONE"
];
var dataTypes11 = [
  // https://www.ibm.com/docs/en/db2/10.5?topic=plsql-data-types
  "ARRAY",
  "BFILE_BASE",
  "BINARY",
  "BLOB_BASE",
  "CHAR VARYING",
  "CHAR_BASE",
  "CHAR",
  "CHARACTER VARYING",
  "CHARACTER",
  "CLOB_BASE",
  "DATE_BASE",
  "DATE",
  "DECIMAL",
  "DOUBLE",
  "FLOAT",
  "INT",
  "INTERVAL DAY",
  "INTERVAL YEAR",
  "LONG",
  "NATIONAL CHAR VARYING",
  "NATIONAL CHAR",
  "NATIONAL CHARACTER VARYING",
  "NATIONAL CHARACTER",
  "NCHAR VARYING",
  "NCHAR",
  "NCHAR",
  "NUMBER_BASE",
  "NUMBER",
  "NUMBERIC",
  "NVARCHAR",
  "PRECISION",
  "RAW",
  "TIMESTAMP",
  "UROWID",
  "VARCHAR",
  "VARCHAR2"
];

// node_modules/sql-formatter/dist/esm/languages/plsql/plsql.functions.js
var functions11 = [
  // https://docs.oracle.com/cd/B19306_01/server.102/b14200/functions001.htm
  // numeric
  "ABS",
  "ACOS",
  "ASIN",
  "ATAN",
  "ATAN2",
  "BITAND",
  "CEIL",
  "COS",
  "COSH",
  "EXP",
  "FLOOR",
  "LN",
  "LOG",
  "MOD",
  "NANVL",
  "POWER",
  "REMAINDER",
  "ROUND",
  "SIGN",
  "SIN",
  "SINH",
  "SQRT",
  "TAN",
  "TANH",
  "TRUNC",
  "WIDTH_BUCKET",
  // character
  "CHR",
  "CONCAT",
  "INITCAP",
  "LOWER",
  "LPAD",
  "LTRIM",
  "NLS_INITCAP",
  "NLS_LOWER",
  "NLSSORT",
  "NLS_UPPER",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "REPLACE",
  "RPAD",
  "RTRIM",
  "SOUNDEX",
  "SUBSTR",
  "TRANSLATE",
  "TREAT",
  "TRIM",
  "UPPER",
  "NLS_CHARSET_DECL_LEN",
  "NLS_CHARSET_ID",
  "NLS_CHARSET_NAME",
  "ASCII",
  "INSTR",
  "LENGTH",
  "REGEXP_INSTR",
  // datetime
  "ADD_MONTHS",
  "CURRENT_DATE",
  "CURRENT_TIMESTAMP",
  "DBTIMEZONE",
  "EXTRACT",
  "FROM_TZ",
  "LAST_DAY",
  "LOCALTIMESTAMP",
  "MONTHS_BETWEEN",
  "NEW_TIME",
  "NEXT_DAY",
  "NUMTODSINTERVAL",
  "NUMTOYMINTERVAL",
  "ROUND",
  "SESSIONTIMEZONE",
  "SYS_EXTRACT_UTC",
  "SYSDATE",
  "SYSTIMESTAMP",
  "TO_CHAR",
  "TO_TIMESTAMP",
  "TO_TIMESTAMP_TZ",
  "TO_DSINTERVAL",
  "TO_YMINTERVAL",
  "TRUNC",
  "TZ_OFFSET",
  // comparison
  "GREATEST",
  "LEAST",
  // conversion
  "ASCIISTR",
  "BIN_TO_NUM",
  "CAST",
  "CHARTOROWID",
  "COMPOSE",
  "CONVERT",
  "DECOMPOSE",
  "HEXTORAW",
  "NUMTODSINTERVAL",
  "NUMTOYMINTERVAL",
  "RAWTOHEX",
  "RAWTONHEX",
  "ROWIDTOCHAR",
  "ROWIDTONCHAR",
  "SCN_TO_TIMESTAMP",
  "TIMESTAMP_TO_SCN",
  "TO_BINARY_DOUBLE",
  "TO_BINARY_FLOAT",
  "TO_CHAR",
  "TO_CLOB",
  "TO_DATE",
  "TO_DSINTERVAL",
  "TO_LOB",
  "TO_MULTI_BYTE",
  "TO_NCHAR",
  "TO_NCLOB",
  "TO_NUMBER",
  "TO_DSINTERVAL",
  "TO_SINGLE_BYTE",
  "TO_TIMESTAMP",
  "TO_TIMESTAMP_TZ",
  "TO_YMINTERVAL",
  "TO_YMINTERVAL",
  "TRANSLATE",
  "UNISTR",
  // largeObject
  "BFILENAME",
  "EMPTY_BLOB,",
  "EMPTY_CLOB",
  // collection
  "CARDINALITY",
  "COLLECT",
  "POWERMULTISET",
  "POWERMULTISET_BY_CARDINALITY",
  "SET",
  // hierarchical
  "SYS_CONNECT_BY_PATH",
  // dataMining
  "CLUSTER_ID",
  "CLUSTER_PROBABILITY",
  "CLUSTER_SET",
  "FEATURE_ID",
  "FEATURE_SET",
  "FEATURE_VALUE",
  "PREDICTION",
  "PREDICTION_COST",
  "PREDICTION_DETAILS",
  "PREDICTION_PROBABILITY",
  "PREDICTION_SET",
  // xml
  "APPENDCHILDXML",
  "DELETEXML",
  "DEPTH",
  "EXTRACT",
  "EXISTSNODE",
  "EXTRACTVALUE",
  "INSERTCHILDXML",
  "INSERTXMLBEFORE",
  "PATH",
  "SYS_DBURIGEN",
  "SYS_XMLAGG",
  "SYS_XMLGEN",
  "UPDATEXML",
  "XMLAGG",
  "XMLCDATA",
  "XMLCOLATTVAL",
  "XMLCOMMENT",
  "XMLCONCAT",
  "XMLFOREST",
  "XMLPARSE",
  "XMLPI",
  "XMLQUERY",
  "XMLROOT",
  "XMLSEQUENCE",
  "XMLSERIALIZE",
  "XMLTABLE",
  "XMLTRANSFORM",
  // encoding
  "DECODE",
  "DUMP",
  "ORA_HASH",
  "VSIZE",
  // nullRelated
  "COALESCE",
  "LNNVL",
  "NULLIF",
  "NVL",
  "NVL2",
  // env
  "SYS_CONTEXT",
  "SYS_GUID",
  "SYS_TYPEID",
  "UID",
  "USER",
  "USERENV",
  // aggregate
  "AVG",
  "COLLECT",
  "CORR",
  "CORR_S",
  "CORR_K",
  "COUNT",
  "COVAR_POP",
  "COVAR_SAMP",
  "CUME_DIST",
  "DENSE_RANK",
  "FIRST",
  "GROUP_ID",
  "GROUPING",
  "GROUPING_ID",
  "LAST",
  "MAX",
  "MEDIAN",
  "MIN",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PERCENT_RANK",
  "RANK",
  "REGR_SLOPE",
  "REGR_INTERCEPT",
  "REGR_COUNT",
  "REGR_R2",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_SXX",
  "REGR_SYY",
  "REGR_SXY",
  "STATS_BINOMIAL_TEST",
  "STATS_CROSSTAB",
  "STATS_F_TEST",
  "STATS_KS_TEST",
  "STATS_MODE",
  "STATS_MW_TEST",
  "STATS_ONE_WAY_ANOVA",
  "STATS_T_TEST_ONE",
  "STATS_T_TEST_PAIRED",
  "STATS_T_TEST_INDEP",
  "STATS_T_TEST_INDEPU",
  "STATS_WSR_TEST",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "SUM",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  // Windowing functions (minus the ones already listed in aggregates)
  // window
  "FIRST_VALUE",
  "LAG",
  "LAST_VALUE",
  "LEAD",
  "NTILE",
  "RATIO_TO_REPORT",
  "ROW_NUMBER",
  // objectReference
  "DEREF",
  "MAKE_REF",
  "REF",
  "REFTOHEX",
  "VALUE",
  // model
  "CV",
  "ITERATION_NUMBER",
  "PRESENTNNV",
  "PRESENTV",
  "PREVIOUS"
];

// node_modules/sql-formatter/dist/esm/languages/plsql/plsql.formatter.js
var reservedSelect11 = expandPhrases(["SELECT [ALL | DISTINCT | UNIQUE]"]);
var reservedClauses11 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER [SIBLINGS] BY",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  "FOR UPDATE [OF]",
  // Data manipulation
  // - insert:
  "INSERT [INTO | ALL INTO]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE [INTO]",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  // other
  "RETURNING"
]);
var standardOnelineClauses10 = expandPhrases([
  "CREATE [GLOBAL TEMPORARY | PRIVATE TEMPORARY | SHARDED | DUPLICATED | IMMUTABLE BLOCKCHAIN | BLOCKCHAIN | IMMUTABLE] TABLE"
]);
var tabularOnelineClauses10 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [NO FORCE | FORCE] [EDITIONING | EDITIONABLE | EDITIONABLE EDITIONING | NONEDITIONABLE] VIEW",
  "CREATE MATERIALIZED VIEW",
  // - update:
  "UPDATE [ONLY]",
  // - delete:
  "DELETE FROM [ONLY]",
  // - drop table:
  "DROP TABLE",
  // - alter table:
  "ALTER TABLE",
  "ADD",
  "DROP {COLUMN | UNUSED COLUMNS | COLUMNS CONTINUE}",
  "MODIFY",
  "RENAME TO",
  "RENAME COLUMN",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "SET SCHEMA",
  "BEGIN",
  "CONNECT BY",
  "DECLARE",
  "EXCEPT",
  "EXCEPTION",
  "LOOP",
  "START WITH"
]);
var reservedSetOperations11 = expandPhrases(["UNION [ALL]", "MINUS", "INTERSECT"]);
var reservedJoins11 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN",
  // non-standard joins
  "{CROSS | OUTER} APPLY"
]);
var reservedKeywordPhrases10 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL]",
  "ON COMMIT",
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases10 = expandPhrases([]);
var plsql = {
  name: "plsql",
  tokenizerOptions: {
    reservedSelect: reservedSelect11,
    reservedClauses: [...reservedClauses11, ...standardOnelineClauses10, ...tabularOnelineClauses10],
    reservedSetOperations: reservedSetOperations11,
    reservedJoins: reservedJoins11,
    reservedKeywordPhrases: reservedKeywordPhrases10,
    reservedDataTypePhrases: reservedDataTypePhrases10,
    supportsXor: true,
    reservedKeywords: keywords11,
    reservedDataTypes: dataTypes11,
    reservedFunctionNames: functions11,
    stringTypes: [
      { quote: "''-qq", prefixes: ["N"] },
      { quote: "q''", prefixes: ["N"] }
    ],
    // PL/SQL doesn't actually support escaping of quotes in identifiers,
    // but for the sake of simpler testing we'll support this anyway
    // as all other SQL dialects with "identifiers" do.
    identTypes: [`""-qq`],
    identChars: { rest: "$#" },
    variableTypes: [{ regex: "&{1,2}[A-Za-z][A-Za-z0-9_$#]*" }],
    paramTypes: { numbered: [":"], named: [":"] },
    operators: [
      "**",
      ":=",
      "%",
      "~=",
      "^=",
      // '..', // Conflicts with float followed by dot (so "2..3" gets parsed as ["2.", ".", "3"])
      ">>",
      "<<",
      "=>",
      "@",
      "||"
    ],
    postProcess: postProcess4
  },
  formatOptions: {
    alwaysDenseOperators: ["@"],
    onelineClauses: [...standardOnelineClauses10, ...tabularOnelineClauses10],
    tabularOnelineClauses: tabularOnelineClauses10
  }
};
function postProcess4(tokens) {
  let previousReservedToken = EOF_TOKEN;
  return tokens.map((token) => {
    if (isToken.SET(token) && isToken.BY(previousReservedToken)) {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_KEYWORD });
    }
    if (isReserved(token.type)) {
      previousReservedToken = token;
    }
    return token;
  });
}

// node_modules/sql-formatter/dist/esm/languages/postgresql/postgresql.functions.js
var functions12 = [
  // https://www.postgresql.org/docs/14/functions.html
  //
  // https://www.postgresql.org/docs/14/functions-math.html
  "ABS",
  "ACOS",
  "ACOSD",
  "ACOSH",
  "ASIN",
  "ASIND",
  "ASINH",
  "ATAN",
  "ATAN2",
  "ATAN2D",
  "ATAND",
  "ATANH",
  "CBRT",
  "CEIL",
  "CEILING",
  "COS",
  "COSD",
  "COSH",
  "COT",
  "COTD",
  "DEGREES",
  "DIV",
  "EXP",
  "FACTORIAL",
  "FLOOR",
  "GCD",
  "LCM",
  "LN",
  "LOG",
  "LOG10",
  "MIN_SCALE",
  "MOD",
  "PI",
  "POWER",
  "RADIANS",
  "RANDOM",
  "ROUND",
  "SCALE",
  "SETSEED",
  "SIGN",
  "SIN",
  "SIND",
  "SINH",
  "SQRT",
  "TAN",
  "TAND",
  "TANH",
  "TRIM_SCALE",
  "TRUNC",
  "WIDTH_BUCKET",
  // https://www.postgresql.org/docs/14/functions-string.html
  "ABS",
  "ASCII",
  "BIT_LENGTH",
  "BTRIM",
  "CHARACTER_LENGTH",
  "CHAR_LENGTH",
  "CHR",
  "CONCAT",
  "CONCAT_WS",
  "FORMAT",
  "INITCAP",
  "LEFT",
  "LENGTH",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MD5",
  "NORMALIZE",
  "OCTET_LENGTH",
  "OVERLAY",
  "PARSE_IDENT",
  "PG_CLIENT_ENCODING",
  "POSITION",
  "QUOTE_IDENT",
  "QUOTE_LITERAL",
  "QUOTE_NULLABLE",
  "REGEXP_MATCH",
  "REGEXP_MATCHES",
  "REGEXP_REPLACE",
  "REGEXP_SPLIT_TO_ARRAY",
  "REGEXP_SPLIT_TO_TABLE",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "RIGHT",
  "RPAD",
  "RTRIM",
  "SPLIT_PART",
  "SPRINTF",
  "STARTS_WITH",
  "STRING_AGG",
  "STRING_TO_ARRAY",
  "STRING_TO_TABLE",
  "STRPOS",
  "SUBSTR",
  "SUBSTRING",
  "TO_ASCII",
  "TO_HEX",
  "TRANSLATE",
  "TRIM",
  "UNISTR",
  "UPPER",
  // https://www.postgresql.org/docs/14/functions-binarystring.html
  "BIT_COUNT",
  "BIT_LENGTH",
  "BTRIM",
  "CONVERT",
  "CONVERT_FROM",
  "CONVERT_TO",
  "DECODE",
  "ENCODE",
  "GET_BIT",
  "GET_BYTE",
  "LENGTH",
  "LTRIM",
  "MD5",
  "OCTET_LENGTH",
  "OVERLAY",
  "POSITION",
  "RTRIM",
  "SET_BIT",
  "SET_BYTE",
  "SHA224",
  "SHA256",
  "SHA384",
  "SHA512",
  "STRING_AGG",
  "SUBSTR",
  "SUBSTRING",
  "TRIM",
  // https://www.postgresql.org/docs/14/functions-bitstring.html
  "BIT_COUNT",
  "BIT_LENGTH",
  "GET_BIT",
  "LENGTH",
  "OCTET_LENGTH",
  "OVERLAY",
  "POSITION",
  "SET_BIT",
  "SUBSTRING",
  // https://www.postgresql.org/docs/14/functions-matching.html
  "REGEXP_MATCH",
  "REGEXP_MATCHES",
  "REGEXP_REPLACE",
  "REGEXP_SPLIT_TO_ARRAY",
  "REGEXP_SPLIT_TO_TABLE",
  // https://www.postgresql.org/docs/14/functions-formatting.html
  "TO_CHAR",
  "TO_DATE",
  "TO_NUMBER",
  "TO_TIMESTAMP",
  // https://www.postgresql.org/docs/14/functions-datetime.html
  // 'AGE',
  "CLOCK_TIMESTAMP",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "DATE_BIN",
  "DATE_PART",
  "DATE_TRUNC",
  "EXTRACT",
  "ISFINITE",
  "JUSTIFY_DAYS",
  "JUSTIFY_HOURS",
  "JUSTIFY_INTERVAL",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "MAKE_DATE",
  "MAKE_INTERVAL",
  "MAKE_TIME",
  "MAKE_TIMESTAMP",
  "MAKE_TIMESTAMPTZ",
  "NOW",
  "PG_SLEEP",
  "PG_SLEEP_FOR",
  "PG_SLEEP_UNTIL",
  "STATEMENT_TIMESTAMP",
  "TIMEOFDAY",
  "TO_TIMESTAMP",
  "TRANSACTION_TIMESTAMP",
  // https://www.postgresql.org/docs/14/functions-enum.html
  "ENUM_FIRST",
  "ENUM_LAST",
  "ENUM_RANGE",
  // https://www.postgresql.org/docs/14/functions-geometry.html
  "AREA",
  "BOUND_BOX",
  "BOX",
  "CENTER",
  "CIRCLE",
  "DIAGONAL",
  "DIAMETER",
  "HEIGHT",
  "ISCLOSED",
  "ISOPEN",
  "LENGTH",
  "LINE",
  "LSEG",
  "NPOINTS",
  "PATH",
  "PCLOSE",
  "POINT",
  "POLYGON",
  "POPEN",
  "RADIUS",
  "SLOPE",
  "WIDTH",
  // https://www.postgresql.org/docs/14/functions-net.html
  "ABBREV",
  "BROADCAST",
  "FAMILY",
  "HOST",
  "HOSTMASK",
  "INET_MERGE",
  "INET_SAME_FAMILY",
  "MACADDR8_SET7BIT",
  "MASKLEN",
  "NETMASK",
  "NETWORK",
  "SET_MASKLEN",
  // 'TEXT', // excluded because it's also a data type name
  "TRUNC",
  // https://www.postgresql.org/docs/14/functions-textsearch.html
  "ARRAY_TO_TSVECTOR",
  "GET_CURRENT_TS_CONFIG",
  "JSONB_TO_TSVECTOR",
  "JSON_TO_TSVECTOR",
  "LENGTH",
  "NUMNODE",
  "PHRASETO_TSQUERY",
  "PLAINTO_TSQUERY",
  "QUERYTREE",
  "SETWEIGHT",
  "STRIP",
  "TO_TSQUERY",
  "TO_TSVECTOR",
  "TSQUERY_PHRASE",
  "TSVECTOR_TO_ARRAY",
  "TS_DEBUG",
  "TS_DELETE",
  "TS_FILTER",
  "TS_HEADLINE",
  "TS_LEXIZE",
  "TS_PARSE",
  "TS_RANK",
  "TS_RANK_CD",
  "TS_REWRITE",
  "TS_STAT",
  "TS_TOKEN_TYPE",
  "WEBSEARCH_TO_TSQUERY",
  // https://www.postgresql.org/docs/18/functions-uuid.html
  "GEN_RANDOM_UUID",
  "UUIDV4",
  "UUIDV7",
  "UUID_EXTRACT_TIMESTAMP",
  "UUID_EXTRACT_VERSION",
  // https://www.postgresql.org/docs/14/functions-xml.html
  "CURSOR_TO_XML",
  "CURSOR_TO_XMLSCHEMA",
  "DATABASE_TO_XML",
  "DATABASE_TO_XMLSCHEMA",
  "DATABASE_TO_XML_AND_XMLSCHEMA",
  "NEXTVAL",
  "QUERY_TO_XML",
  "QUERY_TO_XMLSCHEMA",
  "QUERY_TO_XML_AND_XMLSCHEMA",
  "SCHEMA_TO_XML",
  "SCHEMA_TO_XMLSCHEMA",
  "SCHEMA_TO_XML_AND_XMLSCHEMA",
  "STRING",
  "TABLE_TO_XML",
  "TABLE_TO_XMLSCHEMA",
  "TABLE_TO_XML_AND_XMLSCHEMA",
  "XMLAGG",
  "XMLCOMMENT",
  "XMLCONCAT",
  "XMLELEMENT",
  "XMLEXISTS",
  "XMLFOREST",
  "XMLPARSE",
  "XMLPI",
  "XMLROOT",
  "XMLSERIALIZE",
  "XMLTABLE",
  "XML_IS_WELL_FORMED",
  "XML_IS_WELL_FORMED_CONTENT",
  "XML_IS_WELL_FORMED_DOCUMENT",
  "XPATH",
  "XPATH_EXISTS",
  // https://www.postgresql.org/docs/14/functions-json.html
  "ARRAY_TO_JSON",
  "JSONB_AGG",
  "JSONB_ARRAY_ELEMENTS",
  "JSONB_ARRAY_ELEMENTS_TEXT",
  "JSONB_ARRAY_LENGTH",
  "JSONB_BUILD_ARRAY",
  "JSONB_BUILD_OBJECT",
  "JSONB_EACH",
  "JSONB_EACH_TEXT",
  "JSONB_EXTRACT_PATH",
  "JSONB_EXTRACT_PATH_TEXT",
  "JSONB_INSERT",
  "JSONB_OBJECT",
  "JSONB_OBJECT_AGG",
  "JSONB_OBJECT_KEYS",
  "JSONB_PATH_EXISTS",
  "JSONB_PATH_EXISTS_TZ",
  "JSONB_PATH_MATCH",
  "JSONB_PATH_MATCH_TZ",
  "JSONB_PATH_QUERY",
  "JSONB_PATH_QUERY_ARRAY",
  "JSONB_PATH_QUERY_ARRAY_TZ",
  "JSONB_PATH_QUERY_FIRST",
  "JSONB_PATH_QUERY_FIRST_TZ",
  "JSONB_PATH_QUERY_TZ",
  "JSONB_POPULATE_RECORD",
  "JSONB_POPULATE_RECORDSET",
  "JSONB_PRETTY",
  "JSONB_SET",
  "JSONB_SET_LAX",
  "JSONB_STRIP_NULLS",
  "JSONB_TO_RECORD",
  "JSONB_TO_RECORDSET",
  "JSONB_TYPEOF",
  "JSON_AGG",
  "JSON_ARRAY_ELEMENTS",
  "JSON_ARRAY_ELEMENTS_TEXT",
  "JSON_ARRAY_LENGTH",
  "JSON_BUILD_ARRAY",
  "JSON_BUILD_OBJECT",
  "JSON_EACH",
  "JSON_EACH_TEXT",
  "JSON_EXTRACT_PATH",
  "JSON_EXTRACT_PATH_TEXT",
  "JSON_OBJECT",
  "JSON_OBJECT_AGG",
  "JSON_OBJECT_KEYS",
  "JSON_POPULATE_RECORD",
  "JSON_POPULATE_RECORDSET",
  "JSON_STRIP_NULLS",
  "JSON_TO_RECORD",
  "JSON_TO_RECORDSET",
  "JSON_TYPEOF",
  "ROW_TO_JSON",
  "TO_JSON",
  "TO_JSONB",
  "TO_TIMESTAMP",
  // https://www.postgresql.org/docs/14/functions-sequence.html
  "CURRVAL",
  "LASTVAL",
  "NEXTVAL",
  "SETVAL",
  // https://www.postgresql.org/docs/14/functions-conditional.html
  // 'CASE',
  "COALESCE",
  "GREATEST",
  "LEAST",
  "NULLIF",
  // https://www.postgresql.org/docs/14/functions-array.html
  "ARRAY_AGG",
  "ARRAY_APPEND",
  "ARRAY_CAT",
  "ARRAY_DIMS",
  "ARRAY_FILL",
  "ARRAY_LENGTH",
  "ARRAY_LOWER",
  "ARRAY_NDIMS",
  "ARRAY_POSITION",
  "ARRAY_POSITIONS",
  "ARRAY_PREPEND",
  "ARRAY_REMOVE",
  "ARRAY_REPLACE",
  "ARRAY_TO_STRING",
  "ARRAY_UPPER",
  "CARDINALITY",
  "STRING_TO_ARRAY",
  "TRIM_ARRAY",
  "UNNEST",
  // https://www.postgresql.org/docs/14/functions-range.html
  "ISEMPTY",
  "LOWER",
  "LOWER_INC",
  "LOWER_INF",
  "MULTIRANGE",
  "RANGE_MERGE",
  "UPPER",
  "UPPER_INC",
  "UPPER_INF",
  // https://www.postgresql.org/docs/14/functions-aggregate.html
  // 'ANY',
  "ARRAY_AGG",
  "AVG",
  "BIT_AND",
  "BIT_OR",
  "BIT_XOR",
  "BOOL_AND",
  "BOOL_OR",
  "COALESCE",
  "CORR",
  "COUNT",
  "COVAR_POP",
  "COVAR_SAMP",
  "CUME_DIST",
  "DENSE_RANK",
  "EVERY",
  "GROUPING",
  "JSONB_AGG",
  "JSONB_OBJECT_AGG",
  "JSON_AGG",
  "JSON_OBJECT_AGG",
  "MAX",
  "MIN",
  "MODE",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PERCENT_RANK",
  "RANGE_AGG",
  "RANGE_INTERSECT_AGG",
  "RANK",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  // 'SOME',
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STRING_AGG",
  "SUM",
  "TO_JSON",
  "TO_JSONB",
  "VARIANCE",
  "VAR_POP",
  "VAR_SAMP",
  "XMLAGG",
  // https://www.postgresql.org/docs/14/functions-window.html
  "CUME_DIST",
  "DENSE_RANK",
  "FIRST_VALUE",
  "LAG",
  "LAST_VALUE",
  "LEAD",
  "NTH_VALUE",
  "NTILE",
  "PERCENT_RANK",
  "RANK",
  "ROW_NUMBER",
  // https://www.postgresql.org/docs/14/functions-srf.html
  "GENERATE_SERIES",
  "GENERATE_SUBSCRIPTS",
  // https://www.postgresql.org/docs/14/functions-info.html
  "ACLDEFAULT",
  "ACLEXPLODE",
  "COL_DESCRIPTION",
  "CURRENT_CATALOG",
  "CURRENT_DATABASE",
  "CURRENT_QUERY",
  "CURRENT_ROLE",
  "CURRENT_SCHEMA",
  "CURRENT_SCHEMAS",
  "CURRENT_USER",
  "FORMAT_TYPE",
  "HAS_ANY_COLUMN_PRIVILEGE",
  "HAS_COLUMN_PRIVILEGE",
  "HAS_DATABASE_PRIVILEGE",
  "HAS_FOREIGN_DATA_WRAPPER_PRIVILEGE",
  "HAS_FUNCTION_PRIVILEGE",
  "HAS_LANGUAGE_PRIVILEGE",
  "HAS_SCHEMA_PRIVILEGE",
  "HAS_SEQUENCE_PRIVILEGE",
  "HAS_SERVER_PRIVILEGE",
  "HAS_TABLESPACE_PRIVILEGE",
  "HAS_TABLE_PRIVILEGE",
  "HAS_TYPE_PRIVILEGE",
  "INET_CLIENT_ADDR",
  "INET_CLIENT_PORT",
  "INET_SERVER_ADDR",
  "INET_SERVER_PORT",
  "MAKEACLITEM",
  "OBJ_DESCRIPTION",
  "PG_BACKEND_PID",
  "PG_BLOCKING_PIDS",
  "PG_COLLATION_IS_VISIBLE",
  "PG_CONF_LOAD_TIME",
  "PG_CONTROL_CHECKPOINT",
  "PG_CONTROL_INIT",
  "PG_CONTROL_SYSTEM",
  "PG_CONVERSION_IS_VISIBLE",
  "PG_CURRENT_LOGFILE",
  "PG_CURRENT_SNAPSHOT",
  "PG_CURRENT_XACT_ID",
  "PG_CURRENT_XACT_ID_IF_ASSIGNED",
  "PG_DESCRIBE_OBJECT",
  "PG_FUNCTION_IS_VISIBLE",
  "PG_GET_CATALOG_FOREIGN_KEYS",
  "PG_GET_CONSTRAINTDEF",
  "PG_GET_EXPR",
  "PG_GET_FUNCTIONDEF",
  "PG_GET_FUNCTION_ARGUMENTS",
  "PG_GET_FUNCTION_IDENTITY_ARGUMENTS",
  "PG_GET_FUNCTION_RESULT",
  "PG_GET_INDEXDEF",
  "PG_GET_KEYWORDS",
  "PG_GET_OBJECT_ADDRESS",
  "PG_GET_OWNED_SEQUENCE",
  "PG_GET_RULEDEF",
  "PG_GET_SERIAL_SEQUENCE",
  "PG_GET_STATISTICSOBJDEF",
  "PG_GET_TRIGGERDEF",
  "PG_GET_USERBYID",
  "PG_GET_VIEWDEF",
  "PG_HAS_ROLE",
  "PG_IDENTIFY_OBJECT",
  "PG_IDENTIFY_OBJECT_AS_ADDRESS",
  "PG_INDEXAM_HAS_PROPERTY",
  "PG_INDEX_COLUMN_HAS_PROPERTY",
  "PG_INDEX_HAS_PROPERTY",
  "PG_IS_OTHER_TEMP_SCHEMA",
  "PG_JIT_AVAILABLE",
  "PG_LAST_COMMITTED_XACT",
  "PG_LISTENING_CHANNELS",
  "PG_MY_TEMP_SCHEMA",
  "PG_NOTIFICATION_QUEUE_USAGE",
  "PG_OPCLASS_IS_VISIBLE",
  "PG_OPERATOR_IS_VISIBLE",
  "PG_OPFAMILY_IS_VISIBLE",
  "PG_OPTIONS_TO_TABLE",
  "PG_POSTMASTER_START_TIME",
  "PG_SAFE_SNAPSHOT_BLOCKING_PIDS",
  "PG_SNAPSHOT_XIP",
  "PG_SNAPSHOT_XMAX",
  "PG_SNAPSHOT_XMIN",
  "PG_STATISTICS_OBJ_IS_VISIBLE",
  "PG_TABLESPACE_DATABASES",
  "PG_TABLESPACE_LOCATION",
  "PG_TABLE_IS_VISIBLE",
  "PG_TRIGGER_DEPTH",
  "PG_TS_CONFIG_IS_VISIBLE",
  "PG_TS_DICT_IS_VISIBLE",
  "PG_TS_PARSER_IS_VISIBLE",
  "PG_TS_TEMPLATE_IS_VISIBLE",
  "PG_TYPEOF",
  "PG_TYPE_IS_VISIBLE",
  "PG_VISIBLE_IN_SNAPSHOT",
  "PG_XACT_COMMIT_TIMESTAMP",
  "PG_XACT_COMMIT_TIMESTAMP_ORIGIN",
  "PG_XACT_STATUS",
  "PQSERVERVERSION",
  "ROW_SECURITY_ACTIVE",
  "SESSION_USER",
  "SHOBJ_DESCRIPTION",
  "TO_REGCLASS",
  "TO_REGCOLLATION",
  "TO_REGNAMESPACE",
  "TO_REGOPER",
  "TO_REGOPERATOR",
  "TO_REGPROC",
  "TO_REGPROCEDURE",
  "TO_REGROLE",
  "TO_REGTYPE",
  "TXID_CURRENT",
  "TXID_CURRENT_IF_ASSIGNED",
  "TXID_CURRENT_SNAPSHOT",
  "TXID_SNAPSHOT_XIP",
  "TXID_SNAPSHOT_XMAX",
  "TXID_SNAPSHOT_XMIN",
  "TXID_STATUS",
  "TXID_VISIBLE_IN_SNAPSHOT",
  "USER",
  "VERSION",
  // https://www.postgresql.org/docs/14/functions-admin.html
  "BRIN_DESUMMARIZE_RANGE",
  "BRIN_SUMMARIZE_NEW_VALUES",
  "BRIN_SUMMARIZE_RANGE",
  "CONVERT_FROM",
  "CURRENT_SETTING",
  "GIN_CLEAN_PENDING_LIST",
  "PG_ADVISORY_LOCK",
  "PG_ADVISORY_LOCK_SHARED",
  "PG_ADVISORY_UNLOCK",
  "PG_ADVISORY_UNLOCK_ALL",
  "PG_ADVISORY_UNLOCK_SHARED",
  "PG_ADVISORY_XACT_LOCK",
  "PG_ADVISORY_XACT_LOCK_SHARED",
  "PG_BACKUP_START_TIME",
  "PG_CANCEL_BACKEND",
  "PG_COLLATION_ACTUAL_VERSION",
  "PG_COLUMN_COMPRESSION",
  "PG_COLUMN_SIZE",
  "PG_COPY_LOGICAL_REPLICATION_SLOT",
  "PG_COPY_PHYSICAL_REPLICATION_SLOT",
  "PG_CREATE_LOGICAL_REPLICATION_SLOT",
  "PG_CREATE_PHYSICAL_REPLICATION_SLOT",
  "PG_CREATE_RESTORE_POINT",
  "PG_CURRENT_WAL_FLUSH_LSN",
  "PG_CURRENT_WAL_INSERT_LSN",
  "PG_CURRENT_WAL_LSN",
  "PG_DATABASE_SIZE",
  "PG_DROP_REPLICATION_SLOT",
  "PG_EXPORT_SNAPSHOT",
  "PG_FILENODE_RELATION",
  "PG_GET_WAL_REPLAY_PAUSE_STATE",
  "PG_IMPORT_SYSTEM_COLLATIONS",
  "PG_INDEXES_SIZE",
  "PG_IS_IN_BACKUP",
  "PG_IS_IN_RECOVERY",
  "PG_IS_WAL_REPLAY_PAUSED",
  "PG_LAST_WAL_RECEIVE_LSN",
  "PG_LAST_WAL_REPLAY_LSN",
  "PG_LAST_XACT_REPLAY_TIMESTAMP",
  "PG_LOGICAL_EMIT_MESSAGE",
  "PG_LOGICAL_SLOT_GET_BINARY_CHANGES",
  "PG_LOGICAL_SLOT_GET_CHANGES",
  "PG_LOGICAL_SLOT_PEEK_BINARY_CHANGES",
  "PG_LOGICAL_SLOT_PEEK_CHANGES",
  "PG_LOG_BACKEND_MEMORY_CONTEXTS",
  "PG_LS_ARCHIVE_STATUSDIR",
  "PG_LS_DIR",
  "PG_LS_LOGDIR",
  "PG_LS_TMPDIR",
  "PG_LS_WALDIR",
  "PG_PARTITION_ANCESTORS",
  "PG_PARTITION_ROOT",
  "PG_PARTITION_TREE",
  "PG_PROMOTE",
  "PG_READ_BINARY_FILE",
  "PG_READ_FILE",
  "PG_RELATION_FILENODE",
  "PG_RELATION_FILEPATH",
  "PG_RELATION_SIZE",
  "PG_RELOAD_CONF",
  "PG_REPLICATION_ORIGIN_ADVANCE",
  "PG_REPLICATION_ORIGIN_CREATE",
  "PG_REPLICATION_ORIGIN_DROP",
  "PG_REPLICATION_ORIGIN_OID",
  "PG_REPLICATION_ORIGIN_PROGRESS",
  "PG_REPLICATION_ORIGIN_SESSION_IS_SETUP",
  "PG_REPLICATION_ORIGIN_SESSION_PROGRESS",
  "PG_REPLICATION_ORIGIN_SESSION_RESET",
  "PG_REPLICATION_ORIGIN_SESSION_SETUP",
  "PG_REPLICATION_ORIGIN_XACT_RESET",
  "PG_REPLICATION_ORIGIN_XACT_SETUP",
  "PG_REPLICATION_SLOT_ADVANCE",
  "PG_ROTATE_LOGFILE",
  "PG_SIZE_BYTES",
  "PG_SIZE_PRETTY",
  "PG_START_BACKUP",
  "PG_STAT_FILE",
  "PG_STOP_BACKUP",
  "PG_SWITCH_WAL",
  "PG_TABLESPACE_SIZE",
  "PG_TABLE_SIZE",
  "PG_TERMINATE_BACKEND",
  "PG_TOTAL_RELATION_SIZE",
  "PG_TRY_ADVISORY_LOCK",
  "PG_TRY_ADVISORY_LOCK_SHARED",
  "PG_TRY_ADVISORY_XACT_LOCK",
  "PG_TRY_ADVISORY_XACT_LOCK_SHARED",
  "PG_WALFILE_NAME",
  "PG_WALFILE_NAME_OFFSET",
  "PG_WAL_LSN_DIFF",
  "PG_WAL_REPLAY_PAUSE",
  "PG_WAL_REPLAY_RESUME",
  "SET_CONFIG",
  // https://www.postgresql.org/docs/14/functions-trigger.html
  "SUPPRESS_REDUNDANT_UPDATES_TRIGGER",
  "TSVECTOR_UPDATE_TRIGGER",
  "TSVECTOR_UPDATE_TRIGGER_COLUMN",
  // https://www.postgresql.org/docs/14/functions-event-triggers.html
  "PG_EVENT_TRIGGER_DDL_COMMANDS",
  "PG_EVENT_TRIGGER_DROPPED_OBJECTS",
  "PG_EVENT_TRIGGER_TABLE_REWRITE_OID",
  "PG_EVENT_TRIGGER_TABLE_REWRITE_REASON",
  "PG_GET_OBJECT_ADDRESS",
  // https://www.postgresql.org/docs/14/functions-statistics.html
  "PG_MCV_LIST_ITEMS",
  // cast
  "CAST"
];

// node_modules/sql-formatter/dist/esm/languages/postgresql/postgresql.keywords.js
var keywords12 = [
  // https://www.postgresql.org/docs/14/sql-keywords-appendix.html
  "ALL",
  "ANALYSE",
  "ANALYZE",
  "AND",
  "ANY",
  "AS",
  "ASC",
  "ASYMMETRIC",
  "AUTHORIZATION",
  "BETWEEN",
  "BINARY",
  "BOTH",
  "CASE",
  "CAST",
  "CHECK",
  "COLLATE",
  "COLLATION",
  "COLUMN",
  "CONCURRENTLY",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "CURRENT_CATALOG",
  "CURRENT_DATE",
  "CURRENT_ROLE",
  "CURRENT_SCHEMA",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "DAY",
  "DEFAULT",
  "DEFERRABLE",
  "DESC",
  "DISTINCT",
  "DO",
  "ELSE",
  "END",
  "EXCEPT",
  "EXISTS",
  "FALSE",
  "FETCH",
  "FILTER",
  "FOR",
  "FOREIGN",
  "FREEZE",
  "FROM",
  "FULL",
  "GRANT",
  "GROUP",
  "HAVING",
  "HOUR",
  "ILIKE",
  "IN",
  "INITIALLY",
  "INNER",
  "INOUT",
  "INTERSECT",
  "INTO",
  "IS",
  "ISNULL",
  "JOIN",
  "LATERAL",
  "LEADING",
  "LEFT",
  "LIKE",
  "LIMIT",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "MINUTE",
  "MONTH",
  "NATURAL",
  "NOT",
  "NOTNULL",
  "NULL",
  "NULLIF",
  "OFFSET",
  "ON",
  "ONLY",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OVER",
  "OVERLAPS",
  "PLACING",
  "PRIMARY",
  "REFERENCES",
  "RETURNING",
  "RIGHT",
  "ROW",
  "SECOND",
  "SELECT",
  "SESSION_USER",
  "SIMILAR",
  "SOME",
  "SYMMETRIC",
  "TABLE",
  "TABLESAMPLE",
  "THEN",
  "TO",
  "TRAILING",
  "TRUE",
  "UNION",
  "UNIQUE",
  "USER",
  "USING",
  "VALUES",
  "VARIADIC",
  "VERBOSE",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITHIN",
  "WITHOUT",
  "YEAR"
  // requires AS
];
var dataTypes12 = [
  // https://www.postgresql.org/docs/current/datatype.html
  "ARRAY",
  "BIGINT",
  "BIT",
  "BIT VARYING",
  "BOOL",
  "BOOLEAN",
  "CHAR",
  "CHARACTER",
  "CHARACTER VARYING",
  "DECIMAL",
  "DEC",
  "DOUBLE",
  "ENUM",
  "FLOAT",
  "INT",
  "INTEGER",
  "INTERVAL",
  "NCHAR",
  "NUMERIC",
  "JSON",
  "JSONB",
  "PRECISION",
  "REAL",
  "SMALLINT",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "TIMESTAMPTZ",
  "UUID",
  "VARCHAR",
  "XML",
  "ZONE"
];

// node_modules/sql-formatter/dist/esm/languages/postgresql/postgresql.formatter.js
var reservedSelect12 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses12 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL | DISTINCT]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  "FOR {UPDATE | NO KEY UPDATE | SHARE | KEY SHARE} [OF]",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  "DEFAULT VALUES",
  // - update:
  "SET",
  // other
  "RETURNING"
]);
var standardOnelineClauses11 = expandPhrases([
  "CREATE [GLOBAL | LOCAL] [TEMPORARY | TEMP | UNLOGGED] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses11 = expandPhrases([
  // - create
  "CREATE [OR REPLACE] [TEMP | TEMPORARY] [RECURSIVE] VIEW",
  "CREATE [MATERIALIZED] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE [ONLY]",
  "WHERE CURRENT OF",
  // - insert:
  "ON CONFLICT",
  // - delete:
  "DELETE FROM [ONLY]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS] [ONLY]",
  "ALTER TABLE ALL IN TABLESPACE",
  "RENAME [COLUMN]",
  "RENAME TO",
  "ADD [COLUMN] [IF NOT EXISTS]",
  "DROP [COLUMN] [IF EXISTS]",
  "ALTER [COLUMN]",
  "SET DATA TYPE",
  "{SET | DROP} DEFAULT",
  "{SET | DROP} NOT NULL",
  // - truncate:
  "TRUNCATE [TABLE] [ONLY]",
  // other
  "SET SCHEMA",
  "AFTER",
  // https://www.postgresql.org/docs/14/sql-commands.html
  "ABORT",
  "ALTER AGGREGATE",
  "ALTER COLLATION",
  "ALTER CONVERSION",
  "ALTER DATABASE",
  "ALTER DEFAULT PRIVILEGES",
  "ALTER DOMAIN",
  "ALTER EVENT TRIGGER",
  "ALTER EXTENSION",
  "ALTER FOREIGN DATA WRAPPER",
  "ALTER FOREIGN TABLE",
  "ALTER FUNCTION",
  "ALTER GROUP",
  "ALTER INDEX",
  "ALTER LANGUAGE",
  "ALTER LARGE OBJECT",
  "ALTER MATERIALIZED VIEW",
  "ALTER OPERATOR",
  "ALTER OPERATOR CLASS",
  "ALTER OPERATOR FAMILY",
  "ALTER POLICY",
  "ALTER PROCEDURE",
  "ALTER PUBLICATION",
  "ALTER ROLE",
  "ALTER ROUTINE",
  "ALTER RULE",
  "ALTER SCHEMA",
  "ALTER SEQUENCE",
  "ALTER SERVER",
  "ALTER STATISTICS",
  "ALTER SUBSCRIPTION",
  "ALTER SYSTEM",
  "ALTER TABLESPACE",
  "ALTER TEXT SEARCH CONFIGURATION",
  "ALTER TEXT SEARCH DICTIONARY",
  "ALTER TEXT SEARCH PARSER",
  "ALTER TEXT SEARCH TEMPLATE",
  "ALTER TRIGGER",
  "ALTER TYPE",
  "ALTER USER",
  "ALTER USER MAPPING",
  "ALTER VIEW",
  "ANALYZE",
  "BEGIN",
  "CALL",
  "CHECKPOINT",
  "CLOSE",
  "CLUSTER",
  "COMMENT ON",
  "COMMIT",
  "COMMIT PREPARED",
  "COPY",
  "CREATE ACCESS METHOD",
  "CREATE [OR REPLACE] AGGREGATE",
  "CREATE CAST",
  "CREATE COLLATION",
  "CREATE [DEFAULT] CONVERSION",
  "CREATE DATABASE",
  "CREATE DOMAIN",
  "CREATE EVENT TRIGGER",
  "CREATE EXTENSION",
  "CREATE FOREIGN DATA WRAPPER",
  "CREATE FOREIGN TABLE",
  "CREATE [OR REPLACE] FUNCTION",
  "CREATE GROUP",
  "CREATE [UNIQUE] INDEX",
  "CREATE [OR REPLACE] [TRUSTED] [PROCEDURAL] LANGUAGE",
  "CREATE OPERATOR",
  "CREATE OPERATOR CLASS",
  "CREATE OPERATOR FAMILY",
  "CREATE POLICY",
  "CREATE [OR REPLACE] PROCEDURE",
  "CREATE PUBLICATION",
  "CREATE ROLE",
  "CREATE [OR REPLACE] RULE",
  "CREATE SCHEMA [AUTHORIZATION]",
  "CREATE [TEMPORARY | TEMP | UNLOGGED] SEQUENCE",
  "CREATE SERVER",
  "CREATE STATISTICS",
  "CREATE SUBSCRIPTION",
  "CREATE TABLESPACE",
  "CREATE TEXT SEARCH CONFIGURATION",
  "CREATE TEXT SEARCH DICTIONARY",
  "CREATE TEXT SEARCH PARSER",
  "CREATE TEXT SEARCH TEMPLATE",
  "CREATE [OR REPLACE] TRANSFORM",
  "CREATE [OR REPLACE] [CONSTRAINT] TRIGGER",
  "CREATE TYPE",
  "CREATE USER",
  "CREATE USER MAPPING",
  "DEALLOCATE",
  "DECLARE",
  "DISCARD",
  "DROP ACCESS METHOD",
  "DROP AGGREGATE",
  "DROP CAST",
  "DROP COLLATION",
  "DROP CONVERSION",
  "DROP DATABASE",
  "DROP DOMAIN",
  "DROP EVENT TRIGGER",
  "DROP EXTENSION",
  "DROP FOREIGN DATA WRAPPER",
  "DROP FOREIGN TABLE",
  "DROP FUNCTION",
  "DROP GROUP",
  "DROP IDENTITY",
  "DROP INDEX",
  "DROP LANGUAGE",
  "DROP MATERIALIZED VIEW [IF EXISTS]",
  "DROP OPERATOR",
  "DROP OPERATOR CLASS",
  "DROP OPERATOR FAMILY",
  "DROP OWNED",
  "DROP POLICY",
  "DROP PROCEDURE",
  "DROP PUBLICATION",
  "DROP ROLE",
  "DROP ROUTINE",
  "DROP RULE",
  "DROP SCHEMA",
  "DROP SEQUENCE",
  "DROP SERVER",
  "DROP STATISTICS",
  "DROP SUBSCRIPTION",
  "DROP TABLESPACE",
  "DROP TEXT SEARCH CONFIGURATION",
  "DROP TEXT SEARCH DICTIONARY",
  "DROP TEXT SEARCH PARSER",
  "DROP TEXT SEARCH TEMPLATE",
  "DROP TRANSFORM",
  "DROP TRIGGER",
  "DROP TYPE",
  "DROP USER",
  "DROP USER MAPPING",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FETCH",
  "GRANT",
  "IMPORT FOREIGN SCHEMA",
  "LISTEN",
  "LOAD",
  "LOCK",
  "MOVE",
  "NOTIFY",
  "OVERRIDING SYSTEM VALUE",
  "PREPARE",
  "PREPARE TRANSACTION",
  "REASSIGN OWNED",
  "REFRESH MATERIALIZED VIEW",
  "REINDEX",
  "RELEASE SAVEPOINT",
  "RESET [ALL|ROLE|SESSION AUTHORIZATION]",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK PREPARED",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SECURITY LABEL",
  "SELECT INTO",
  "SET CONSTRAINTS",
  "SET ROLE",
  "SET SESSION AUTHORIZATION",
  "SET TRANSACTION",
  "SHOW",
  "START TRANSACTION",
  "UNLISTEN",
  "VACUUM"
]);
var reservedSetOperations12 = expandPhrases([
  "UNION [ALL | DISTINCT]",
  "EXCEPT [ALL | DISTINCT]",
  "INTERSECT [ALL | DISTINCT]"
]);
var reservedJoins12 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"
]);
var reservedKeywordPhrases11 = expandPhrases([
  "PRIMARY KEY",
  "GENERATED {ALWAYS | BY DEFAULT} AS IDENTITY",
  "ON {UPDATE | DELETE} [NO ACTION | RESTRICT | CASCADE | SET NULL | SET DEFAULT]",
  "DO {NOTHING | UPDATE}",
  "AS MATERIALIZED",
  "{ROWS | RANGE | GROUPS} BETWEEN",
  // comparison operator
  "IS [NOT] DISTINCT FROM",
  "NULLS {FIRST | LAST}",
  "WITH ORDINALITY"
]);
var reservedDataTypePhrases11 = expandPhrases([
  // https://www.postgresql.org/docs/current/datatype-datetime.html
  "[TIMESTAMP | TIME] {WITH | WITHOUT} TIME ZONE"
]);
var postgresql = {
  name: "postgresql",
  tokenizerOptions: {
    reservedSelect: reservedSelect12,
    reservedClauses: [...reservedClauses12, ...standardOnelineClauses11, ...tabularOnelineClauses11],
    reservedSetOperations: reservedSetOperations12,
    reservedJoins: reservedJoins12,
    reservedKeywordPhrases: reservedKeywordPhrases11,
    reservedDataTypePhrases: reservedDataTypePhrases11,
    reservedKeywords: keywords12,
    reservedDataTypes: dataTypes12,
    reservedFunctionNames: functions12,
    nestedBlockComments: true,
    extraParens: ["[]"],
    underscoresInNumbers: true,
    stringTypes: [
      "$$",
      { quote: "''-qq", prefixes: ["U&"] },
      { quote: "''-qq-bs", prefixes: ["E"], requirePrefix: true },
      { quote: "''-raw", prefixes: ["B", "X"], requirePrefix: true }
    ],
    identTypes: [{ quote: '""-qq', prefixes: ["U&"] }],
    identChars: { rest: "$" },
    paramTypes: { numbered: ["$"] },
    operators: [
      // Arithmetic
      "%",
      "^",
      "|/",
      "||/",
      "@",
      // Assignment
      ":=",
      // Bitwise
      "&",
      "|",
      "#",
      "~",
      "<<",
      ">>",
      // Byte comparison
      "~>~",
      "~<~",
      "~>=~",
      "~<=~",
      // Geometric
      "@-@",
      "@@",
      "##",
      "<->",
      "&&",
      "&<",
      "&>",
      "<<|",
      "&<|",
      "|>>",
      "|&>",
      "<^",
      ">^",
      "?#",
      "?-",
      "?|",
      "?-|",
      "?||",
      "@>",
      "<@",
      "<@>",
      "~=",
      // JSON
      "?",
      "@?",
      "?&",
      "->",
      "->>",
      "#>",
      "#>>",
      "#-",
      // Named function params
      "=>",
      // Network address
      ">>=",
      "<<=",
      // Pattern matching
      "~~",
      "~~*",
      "!~~",
      "!~~*",
      // POSIX RegExp
      "~",
      "~*",
      "!~",
      "!~*",
      // Range/multirange
      "-|-",
      // String concatenation
      "||",
      // Text search
      "@@@",
      "!!",
      "^@",
      // Trigram/trigraph
      "<%",
      "%>",
      "<<%",
      "%>>",
      "<<->",
      "<->>",
      "<<<->",
      "<->>>",
      // Cube
      "~>",
      // Hstore
      "#=",
      // Type cast
      "::",
      ":",
      // Custom operators defined by pgvector extension
      // https://github.com/pgvector/pgvector#querying
      "<#>",
      "<=>",
      "<+>",
      "<~>",
      "<%>",
      // Custom operators: from PostGIS extension
      "&&&",
      "|=|"
      // https://postgis.net/docs/geometry_distance_cpa.html
    ],
    operatorKeyword: true
  },
  formatOptions: {
    alwaysDenseOperators: ["::", ":"],
    onelineClauses: [...standardOnelineClauses11, ...tabularOnelineClauses11],
    tabularOnelineClauses: tabularOnelineClauses11
  }
};

// node_modules/sql-formatter/dist/esm/languages/redshift/redshift.functions.js
var functions13 = [
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Aggregate_Functions.html
  "ANY_VALUE",
  "APPROXIMATE PERCENTILE_DISC",
  "AVG",
  "COUNT",
  "LISTAGG",
  "MAX",
  "MEDIAN",
  "MIN",
  "PERCENTILE_CONT",
  "STDDEV_SAMP",
  "STDDEV_POP",
  "SUM",
  "VAR_SAMP",
  "VAR_POP",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Array_Functions.html
  // 'array',
  "array_concat",
  "array_flatten",
  "get_array_length",
  "split_to_array",
  "subarray",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_bitwise_aggregate_functions.html
  "BIT_AND",
  "BIT_OR",
  "BOOL_AND",
  "BOOL_OR",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_conditional_expressions.html
  "COALESCE",
  "DECODE",
  "GREATEST",
  "LEAST",
  "NVL",
  "NVL2",
  "NULLIF",
  // https://docs.aws.amazon.com/redshift/latest/dg/Date_functions_header.html
  "ADD_MONTHS",
  "AT TIME ZONE",
  "CONVERT_TIMEZONE",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "DATE_CMP",
  "DATE_CMP_TIMESTAMP",
  "DATE_CMP_TIMESTAMPTZ",
  "DATE_PART_YEAR",
  "DATEADD",
  "DATEDIFF",
  "DATE_PART",
  "DATE_TRUNC",
  "EXTRACT",
  "GETDATE",
  "INTERVAL_CMP",
  "LAST_DAY",
  "MONTHS_BETWEEN",
  "NEXT_DAY",
  "SYSDATE",
  "TIMEOFDAY",
  "TIMESTAMP_CMP",
  "TIMESTAMP_CMP_DATE",
  "TIMESTAMP_CMP_TIMESTAMPTZ",
  "TIMESTAMPTZ_CMP",
  "TIMESTAMPTZ_CMP_DATE",
  "TIMESTAMPTZ_CMP_TIMESTAMP",
  "TIMEZONE",
  "TO_TIMESTAMP",
  "TRUNC",
  // https://docs.aws.amazon.com/redshift/latest/dg/geospatial-functions.html
  "AddBBox",
  "DropBBox",
  "GeometryType",
  "ST_AddPoint",
  "ST_Angle",
  "ST_Area",
  "ST_AsBinary",
  "ST_AsEWKB",
  "ST_AsEWKT",
  "ST_AsGeoJSON",
  "ST_AsText",
  "ST_Azimuth",
  "ST_Boundary",
  "ST_Collect",
  "ST_Contains",
  "ST_ContainsProperly",
  "ST_ConvexHull",
  "ST_CoveredBy",
  "ST_Covers",
  "ST_Crosses",
  "ST_Dimension",
  "ST_Disjoint",
  "ST_Distance",
  "ST_DistanceSphere",
  "ST_DWithin",
  "ST_EndPoint",
  "ST_Envelope",
  "ST_Equals",
  "ST_ExteriorRing",
  "ST_Force2D",
  "ST_Force3D",
  "ST_Force3DM",
  "ST_Force3DZ",
  "ST_Force4D",
  "ST_GeometryN",
  "ST_GeometryType",
  "ST_GeomFromEWKB",
  "ST_GeomFromEWKT",
  "ST_GeomFromText",
  "ST_GeomFromWKB",
  "ST_InteriorRingN",
  "ST_Intersects",
  "ST_IsPolygonCCW",
  "ST_IsPolygonCW",
  "ST_IsClosed",
  "ST_IsCollection",
  "ST_IsEmpty",
  "ST_IsSimple",
  "ST_IsValid",
  "ST_Length",
  "ST_LengthSphere",
  "ST_Length2D",
  "ST_LineFromMultiPoint",
  "ST_LineInterpolatePoint",
  "ST_M",
  "ST_MakeEnvelope",
  "ST_MakeLine",
  "ST_MakePoint",
  "ST_MakePolygon",
  "ST_MemSize",
  "ST_MMax",
  "ST_MMin",
  "ST_Multi",
  "ST_NDims",
  "ST_NPoints",
  "ST_NRings",
  "ST_NumGeometries",
  "ST_NumInteriorRings",
  "ST_NumPoints",
  "ST_Perimeter",
  "ST_Perimeter2D",
  "ST_Point",
  "ST_PointN",
  "ST_Points",
  "ST_Polygon",
  "ST_RemovePoint",
  "ST_Reverse",
  "ST_SetPoint",
  "ST_SetSRID",
  "ST_Simplify",
  "ST_SRID",
  "ST_StartPoint",
  "ST_Touches",
  "ST_Within",
  "ST_X",
  "ST_XMax",
  "ST_XMin",
  "ST_Y",
  "ST_YMax",
  "ST_YMin",
  "ST_Z",
  "ST_ZMax",
  "ST_ZMin",
  "SupportsBBox",
  // https://docs.aws.amazon.com/redshift/latest/dg/hash-functions.html
  "CHECKSUM",
  "FUNC_SHA1",
  "FNV_HASH",
  "MD5",
  "SHA",
  "SHA1",
  "SHA2",
  // https://docs.aws.amazon.com/redshift/latest/dg/hyperloglog-functions.html
  "HLL",
  "HLL_CREATE_SKETCH",
  "HLL_CARDINALITY",
  "HLL_COMBINE",
  // https://docs.aws.amazon.com/redshift/latest/dg/json-functions.html
  "IS_VALID_JSON",
  "IS_VALID_JSON_ARRAY",
  "JSON_ARRAY_LENGTH",
  "JSON_EXTRACT_ARRAY_ELEMENT_TEXT",
  "JSON_EXTRACT_PATH_TEXT",
  "JSON_PARSE",
  "JSON_SERIALIZE",
  // https://docs.aws.amazon.com/redshift/latest/dg/Math_functions.html
  "ABS",
  "ACOS",
  "ASIN",
  "ATAN",
  "ATAN2",
  "CBRT",
  "CEILING",
  "CEIL",
  "COS",
  "COT",
  "DEGREES",
  "DEXP",
  "DLOG1",
  "DLOG10",
  "EXP",
  "FLOOR",
  "LN",
  "LOG",
  "MOD",
  "PI",
  "POWER",
  "RADIANS",
  "RANDOM",
  "ROUND",
  "SIN",
  "SIGN",
  "SQRT",
  "TAN",
  "TO_HEX",
  "TRUNC",
  // https://docs.aws.amazon.com/redshift/latest/dg/ml-function.html
  "EXPLAIN_MODEL",
  // https://docs.aws.amazon.com/redshift/latest/dg/String_functions_header.html
  "ASCII",
  "BPCHARCMP",
  "BTRIM",
  "BTTEXT_PATTERN_CMP",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "CHARINDEX",
  "CHR",
  "COLLATE",
  "CONCAT",
  "CRC32",
  "DIFFERENCE",
  "INITCAP",
  "LEFT",
  "RIGHT",
  "LEN",
  "LENGTH",
  "LOWER",
  "LPAD",
  "RPAD",
  "LTRIM",
  "OCTETINDEX",
  "OCTET_LENGTH",
  "POSITION",
  "QUOTE_IDENT",
  "QUOTE_LITERAL",
  "REGEXP_COUNT",
  "REGEXP_INSTR",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "REPEAT",
  "REPLACE",
  "REPLICATE",
  "REVERSE",
  "RTRIM",
  "SOUNDEX",
  "SPLIT_PART",
  "STRPOS",
  "STRTOL",
  "SUBSTRING",
  "TEXTLEN",
  "TRANSLATE",
  "TRIM",
  "UPPER",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Type_Info_Functions.html
  "decimal_precision",
  "decimal_scale",
  "is_array",
  "is_bigint",
  "is_boolean",
  "is_char",
  "is_decimal",
  "is_float",
  "is_integer",
  "is_object",
  "is_scalar",
  "is_smallint",
  "is_varchar",
  "json_typeof",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Window_functions.html
  "AVG",
  "COUNT",
  "CUME_DIST",
  "DENSE_RANK",
  "FIRST_VALUE",
  "LAST_VALUE",
  "LAG",
  "LEAD",
  "LISTAGG",
  "MAX",
  "MEDIAN",
  "MIN",
  "NTH_VALUE",
  "NTILE",
  "PERCENT_RANK",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "RANK",
  "RATIO_TO_REPORT",
  "ROW_NUMBER",
  "STDDEV_SAMP",
  "STDDEV_POP",
  "SUM",
  "VAR_SAMP",
  "VAR_POP",
  // https://docs.aws.amazon.com/redshift/latest/dg/r_Data_type_formatting.html
  "CAST",
  "CONVERT",
  "TO_CHAR",
  "TO_DATE",
  "TO_NUMBER",
  "TEXT_TO_INT_ALT",
  "TEXT_TO_NUMERIC_ALT",
  // https://docs.aws.amazon.com/redshift/latest/dg/r_System_administration_functions.html
  "CHANGE_QUERY_PRIORITY",
  "CHANGE_SESSION_PRIORITY",
  "CHANGE_USER_PRIORITY",
  "CURRENT_SETTING",
  "PG_CANCEL_BACKEND",
  "PG_TERMINATE_BACKEND",
  "REBOOT_CLUSTER",
  "SET_CONFIG",
  // https://docs.aws.amazon.com/redshift/latest/dg/r_System_information_functions.html
  "CURRENT_AWS_ACCOUNT",
  "CURRENT_DATABASE",
  "CURRENT_NAMESPACE",
  "CURRENT_SCHEMA",
  "CURRENT_SCHEMAS",
  "CURRENT_USER",
  "CURRENT_USER_ID",
  "HAS_ASSUMEROLE_PRIVILEGE",
  "HAS_DATABASE_PRIVILEGE",
  "HAS_SCHEMA_PRIVILEGE",
  "HAS_TABLE_PRIVILEGE",
  "PG_BACKEND_PID",
  "PG_GET_COLS",
  "PG_GET_GRANTEE_BY_IAM_ROLE",
  "PG_GET_IAM_ROLE_BY_USER",
  "PG_GET_LATE_BINDING_VIEW_COLS",
  "PG_LAST_COPY_COUNT",
  "PG_LAST_COPY_ID",
  "PG_LAST_UNLOAD_ID",
  "PG_LAST_QUERY_ID",
  "PG_LAST_UNLOAD_COUNT",
  "SESSION_USER",
  "SLICE_NUM",
  "USER",
  "VERSION"
];

// node_modules/sql-formatter/dist/esm/languages/redshift/redshift.keywords.js
var keywords13 = [
  // https://docs.aws.amazon.com/redshift/latest/dg/r_pg_keywords.html
  "AES128",
  "AES256",
  "ALL",
  "ALLOWOVERWRITE",
  "ANY",
  "AS",
  "ASC",
  "AUTHORIZATION",
  "BACKUP",
  "BETWEEN",
  "BINARY",
  "BOTH",
  "CHECK",
  "COLUMN",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "DEFAULT",
  "DEFERRABLE",
  "DEFLATE",
  "DEFRAG",
  "DESC",
  "DISABLE",
  "DISTINCT",
  "DO",
  "ENABLE",
  "ENCODE",
  "ENCRYPT",
  "ENCRYPTION",
  "EXPLICIT",
  "FALSE",
  "FOR",
  "FOREIGN",
  "FREEZE",
  "FROM",
  "FULL",
  "GLOBALDICT256",
  "GLOBALDICT64K",
  "GROUP",
  "IDENTITY",
  "IGNORE",
  "ILIKE",
  "IN",
  "INITIALLY",
  "INNER",
  "INTO",
  "IS",
  "ISNULL",
  "LANGUAGE",
  "LEADING",
  "LIKE",
  "LIMIT",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LUN",
  "LUNS",
  "MINUS",
  "NATURAL",
  "NEW",
  "NOT",
  "NOTNULL",
  "NULL",
  "NULLS",
  "OFF",
  "OFFLINE",
  "OFFSET",
  "OID",
  "OLD",
  "ON",
  "ONLY",
  "OPEN",
  "ORDER",
  "OUTER",
  "OVERLAPS",
  "PARALLEL",
  "PARTITION",
  "PERCENT",
  "PERMISSIONS",
  "PLACING",
  "PRIMARY",
  "RECOVER",
  "REFERENCES",
  "REJECTLOG",
  "RESORT",
  "RESPECT",
  "RESTORE",
  "SIMILAR",
  "SNAPSHOT",
  "SOME",
  "SYSTEM",
  "TABLE",
  "TAG",
  "TDES",
  "THEN",
  "TIMESTAMP",
  "TO",
  "TOP",
  "TRAILING",
  "TRUE",
  "UNIQUE",
  "USING",
  "VERBOSE",
  "WALLET",
  "WITHOUT",
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-conversion.html
  "ACCEPTANYDATE",
  "ACCEPTINVCHARS",
  "BLANKSASNULL",
  "DATEFORMAT",
  "EMPTYASNULL",
  "ENCODING",
  "ESCAPE",
  "EXPLICIT_IDS",
  "FILLRECORD",
  "IGNOREBLANKLINES",
  "IGNOREHEADER",
  "REMOVEQUOTES",
  "ROUNDEC",
  "TIMEFORMAT",
  "TRIMBLANKS",
  "TRUNCATECOLUMNS",
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-load.html
  "COMPROWS",
  "COMPUPDATE",
  "MAXERROR",
  "NOLOAD",
  "STATUPDATE",
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-format.html
  "FORMAT",
  "CSV",
  "DELIMITER",
  "FIXEDWIDTH",
  "SHAPEFILE",
  "AVRO",
  "JSON",
  "PARQUET",
  "ORC",
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-authorization.html
  "ACCESS_KEY_ID",
  "CREDENTIALS",
  "ENCRYPTED",
  "IAM_ROLE",
  "MASTER_SYMMETRIC_KEY",
  "SECRET_ACCESS_KEY",
  "SESSION_TOKEN",
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-file-compression.html
  "BZIP2",
  "GZIP",
  "LZOP",
  "ZSTD",
  // https://docs.aws.amazon.com/redshift/latest/dg/r_COPY-alphabetical-parm-list.html
  "MANIFEST",
  "READRATIO",
  "REGION",
  "SSH",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Compression_encodings.html
  "RAW",
  "AZ64",
  "BYTEDICT",
  "DELTA",
  "DELTA32K",
  "LZO",
  "MOSTLY8",
  "MOSTLY16",
  "MOSTLY32",
  "RUNLENGTH",
  "TEXT255",
  "TEXT32K",
  // misc
  // CREATE EXTERNAL SCHEMA (https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html)
  "CATALOG_ROLE",
  "SECRET_ARN",
  "EXTERNAL",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html
  "AUTO",
  "EVEN",
  "KEY",
  "PREDICATE",
  // unknown
  "COMPRESSION"
  /**
   * Other keywords not included:
   * STL: https://docs.aws.amazon.com/redshift/latest/dg/c_intro_STL_tables.html
   * SVCS: https://docs.aws.amazon.com/redshift/latest/dg/svcs_views.html
   * SVL: https://docs.aws.amazon.com/redshift/latest/dg/svl_views.html
   * SVV: https://docs.aws.amazon.com/redshift/latest/dg/svv_views.html
   */
];
var dataTypes13 = [
  // https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-text-and-bpchar-types
  "ARRAY",
  "BIGINT",
  "BPCHAR",
  "CHAR",
  "CHARACTER VARYING",
  "CHARACTER",
  "DECIMAL",
  "INT",
  "INT2",
  "INT4",
  "INT8",
  "INTEGER",
  "NCHAR",
  "NUMERIC",
  "NVARCHAR",
  "SMALLINT",
  "TEXT",
  "VARBYTE",
  "VARCHAR"
];

// node_modules/sql-formatter/dist/esm/languages/redshift/redshift.formatter.js
var reservedSelect13 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses13 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "QUALIFY",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET"
]);
var standardOnelineClauses12 = expandPhrases([
  "CREATE [TEMPORARY | TEMP | LOCAL TEMPORARY | LOCAL TEMP] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses12 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE | MATERIALIZED] VIEW",
  // - update:
  "UPDATE",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ALTER TABLE APPEND",
  "ADD [COLUMN]",
  "DROP [COLUMN]",
  "RENAME TO",
  "RENAME COLUMN",
  "ALTER COLUMN",
  "TYPE",
  "ENCODE",
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_SQL_commands.html
  "ABORT",
  "ALTER DATABASE",
  "ALTER DATASHARE",
  "ALTER DEFAULT PRIVILEGES",
  "ALTER GROUP",
  "ALTER MATERIALIZED VIEW",
  "ALTER PROCEDURE",
  "ALTER SCHEMA",
  "ALTER USER",
  "ANALYSE",
  "ANALYZE",
  "ANALYSE COMPRESSION",
  "ANALYZE COMPRESSION",
  "BEGIN",
  "CALL",
  "CANCEL",
  "CLOSE",
  "COMMIT",
  "COPY",
  "CREATE DATABASE",
  "CREATE DATASHARE",
  "CREATE EXTERNAL FUNCTION",
  "CREATE EXTERNAL SCHEMA",
  "CREATE EXTERNAL TABLE",
  "CREATE FUNCTION",
  "CREATE GROUP",
  "CREATE LIBRARY",
  "CREATE MODEL",
  "CREATE PROCEDURE",
  "CREATE SCHEMA",
  "CREATE USER",
  "DEALLOCATE",
  "DECLARE",
  "DESC DATASHARE",
  "DROP DATABASE",
  "DROP DATASHARE",
  "DROP FUNCTION",
  "DROP GROUP",
  "DROP LIBRARY",
  "DROP MODEL",
  "DROP MATERIALIZED VIEW",
  "DROP PROCEDURE",
  "DROP SCHEMA",
  "DROP USER",
  "DROP VIEW",
  "DROP",
  "EXECUTE",
  "EXPLAIN",
  "FETCH",
  "GRANT",
  "LOCK",
  "PREPARE",
  "REFRESH MATERIALIZED VIEW",
  "RESET",
  "REVOKE",
  "ROLLBACK",
  "SELECT INTO",
  "SET SESSION AUTHORIZATION",
  "SET SESSION CHARACTERISTICS",
  "SHOW",
  "SHOW EXTERNAL TABLE",
  "SHOW MODEL",
  "SHOW DATASHARES",
  "SHOW PROCEDURE",
  "SHOW TABLE",
  "SHOW VIEW",
  "START TRANSACTION",
  "UNLOAD",
  "VACUUM"
]);
var reservedSetOperations13 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT", "MINUS"]);
var reservedJoins13 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"
]);
var reservedKeywordPhrases12 = expandPhrases([
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-conversion.html
  "NULL AS",
  // https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html
  "DATA CATALOG",
  "HIVE METASTORE",
  // in window specifications
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases12 = expandPhrases([]);
var redshift = {
  name: "redshift",
  tokenizerOptions: {
    reservedSelect: reservedSelect13,
    reservedClauses: [...reservedClauses13, ...standardOnelineClauses12, ...tabularOnelineClauses12],
    reservedSetOperations: reservedSetOperations13,
    reservedJoins: reservedJoins13,
    reservedKeywordPhrases: reservedKeywordPhrases12,
    reservedDataTypePhrases: reservedDataTypePhrases12,
    reservedKeywords: keywords13,
    reservedDataTypes: dataTypes13,
    reservedFunctionNames: functions13,
    extraParens: ["[]"],
    stringTypes: ["''-qq"],
    identTypes: [`""-qq`],
    identChars: { first: "#" },
    paramTypes: { numbered: ["$"] },
    operators: [
      "^",
      "%",
      "@",
      "|/",
      "||/",
      "&",
      "|",
      // '#', conflicts with first char of identifier
      "~",
      "<<",
      ">>",
      "||",
      "::"
    ]
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: [...standardOnelineClauses12, ...tabularOnelineClauses12],
    tabularOnelineClauses: tabularOnelineClauses12
  }
};

// node_modules/sql-formatter/dist/esm/languages/spark/spark.keywords.js
var keywords14 = [
  // https://deepkb.com/CO_000013/en/kb/IMPORT-fbfa59f0-2bf1-31fe-bb7b-0f9efe9932c6/spark-sql-keywords
  "ADD",
  "AFTER",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "ANTI",
  "ANY",
  "ARCHIVE",
  "AS",
  "ASC",
  "AT",
  "AUTHORIZATION",
  "BETWEEN",
  "BOTH",
  "BUCKET",
  "BUCKETS",
  "BY",
  "CACHE",
  "CASCADE",
  "CAST",
  "CHANGE",
  "CHECK",
  "CLEAR",
  "CLUSTER",
  "CLUSTERED",
  "CODEGEN",
  "COLLATE",
  "COLLECTION",
  "COLUMN",
  "COLUMNS",
  "COMMENT",
  "COMMIT",
  "COMPACT",
  "COMPACTIONS",
  "COMPUTE",
  "CONCATENATE",
  "CONSTRAINT",
  "COST",
  "CREATE",
  "CROSS",
  "CUBE",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "DATA",
  "DATABASE",
  "DATABASES",
  "DAY",
  "DBPROPERTIES",
  "DEFINED",
  "DELETE",
  "DELIMITED",
  "DESC",
  "DESCRIBE",
  "DFS",
  "DIRECTORIES",
  "DIRECTORY",
  "DISTINCT",
  "DISTRIBUTE",
  "DIV",
  "DROP",
  "ESCAPE",
  "ESCAPED",
  "EXCEPT",
  "EXCHANGE",
  "EXISTS",
  "EXPORT",
  "EXTENDED",
  "EXTERNAL",
  "EXTRACT",
  "FALSE",
  "FETCH",
  "FIELDS",
  "FILTER",
  "FILEFORMAT",
  "FIRST",
  "FIRST_VALUE",
  "FOLLOWING",
  "FOR",
  "FOREIGN",
  "FORMAT",
  "FORMATTED",
  "FULL",
  "FUNCTION",
  "FUNCTIONS",
  "GLOBAL",
  "GRANT",
  "GROUP",
  "GROUPING",
  "HOUR",
  "IF",
  "IGNORE",
  "IMPORT",
  "IN",
  "INDEX",
  "INDEXES",
  "INNER",
  "INPATH",
  "INPUTFORMAT",
  "INTERSECT",
  "INTO",
  "IS",
  "ITEMS",
  "KEYS",
  "LAST",
  "LAST_VALUE",
  "LATERAL",
  "LAZY",
  "LEADING",
  "LEFT",
  "LIKE",
  "LINES",
  "LIST",
  "LOCAL",
  "LOCATION",
  "LOCK",
  "LOCKS",
  "LOGICAL",
  "MACRO",
  "MATCHED",
  "MERGE",
  "MINUTE",
  "MONTH",
  "MSCK",
  "NAMESPACE",
  "NAMESPACES",
  "NATURAL",
  "NO",
  "NOT",
  "NULL",
  "NULLS",
  "OF",
  "ONLY",
  "OPTION",
  "OPTIONS",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OUTPUTFORMAT",
  "OVER",
  "OVERLAPS",
  "OVERLAY",
  "OVERWRITE",
  "OWNER",
  "PARTITION",
  "PARTITIONED",
  "PARTITIONS",
  "PERCENT",
  "PLACING",
  "POSITION",
  "PRECEDING",
  "PRIMARY",
  "PRINCIPALS",
  "PROPERTIES",
  "PURGE",
  "QUERY",
  "RANGE",
  "RECORDREADER",
  "RECORDWRITER",
  "RECOVER",
  "REDUCE",
  "REFERENCES",
  "RENAME",
  "REPAIR",
  "REPLACE",
  "RESPECT",
  "RESTRICT",
  "REVOKE",
  "RIGHT",
  "RLIKE",
  "ROLE",
  "ROLES",
  "ROLLBACK",
  "ROLLUP",
  "ROW",
  "ROWS",
  "SCHEMA",
  "SECOND",
  "SELECT",
  "SEMI",
  "SEPARATED",
  "SERDE",
  "SERDEPROPERTIES",
  "SESSION_USER",
  "SETS",
  "SHOW",
  "SKEWED",
  "SOME",
  "SORT",
  "SORTED",
  "START",
  "STATISTICS",
  "STORED",
  "STRATIFY",
  "SUBSTR",
  "SUBSTRING",
  "TABLE",
  "TABLES",
  "TBLPROPERTIES",
  "TEMPORARY",
  "TERMINATED",
  "THEN",
  "TO",
  "TOUCH",
  "TRAILING",
  "TRANSACTION",
  "TRANSACTIONS",
  "TRIM",
  "TRUE",
  "TRUNCATE",
  "UNARCHIVE",
  "UNBOUNDED",
  "UNCACHE",
  "UNIQUE",
  "UNKNOWN",
  "UNLOCK",
  "UNSET",
  "USE",
  "USER",
  "USING",
  "VIEW",
  "WINDOW",
  "YEAR",
  // other
  "ANALYSE",
  "ARRAY_ZIP",
  "COALESCE",
  "CONTAINS",
  "CONVERT",
  "DAYS",
  "DAY_HOUR",
  "DAY_MINUTE",
  "DAY_SECOND",
  "DECODE",
  "DEFAULT",
  "DISTINCTROW",
  "ENCODE",
  "EXPLODE",
  "EXPLODE_OUTER",
  "FIXED",
  "GREATEST",
  "GROUP_CONCAT",
  "HOURS",
  "HOUR_MINUTE",
  "HOUR_SECOND",
  "IFNULL",
  "LEAST",
  "LEVEL",
  "MINUTE_SECOND",
  "NULLIF",
  "OFFSET",
  "ON",
  "OPTIMIZE",
  "REGEXP",
  "SEPARATOR",
  "SIZE",
  "TYPE",
  "TYPES",
  "UNSIGNED",
  "VARIABLES",
  "YEAR_MONTH"
];
var dataTypes14 = [
  // https://spark.apache.org/docs/latest/sql-ref-datatypes.html
  "ARRAY",
  "BIGINT",
  "BINARY",
  "BOOLEAN",
  "BYTE",
  "CHAR",
  "DATE",
  "DEC",
  "DECIMAL",
  "DOUBLE",
  "FLOAT",
  "INT",
  "INTEGER",
  "INTERVAL",
  "LONG",
  "MAP",
  "NUMERIC",
  "REAL",
  "SHORT",
  "SMALLINT",
  "STRING",
  "STRUCT",
  "TIMESTAMP_LTZ",
  "TIMESTAMP_NTZ",
  "TIMESTAMP",
  "TINYINT",
  "VARCHAR"
  // No varchar type in Spark, only STRING. Added for the sake of tests
];

// node_modules/sql-formatter/dist/esm/languages/spark/spark.functions.js
var functions14 = [
  // http://spark.apache.org/docs/latest/sql-ref-functions.html
  //
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#aggregate-functions
  // 'ANY',
  "APPROX_COUNT_DISTINCT",
  "APPROX_PERCENTILE",
  "AVG",
  "BIT_AND",
  "BIT_OR",
  "BIT_XOR",
  "BOOL_AND",
  "BOOL_OR",
  "COLLECT_LIST",
  "COLLECT_SET",
  "CORR",
  "COUNT",
  "COUNT",
  "COUNT",
  "COUNT_IF",
  "COUNT_MIN_SKETCH",
  "COVAR_POP",
  "COVAR_SAMP",
  "EVERY",
  "FIRST",
  "FIRST_VALUE",
  "GROUPING",
  "GROUPING_ID",
  "KURTOSIS",
  "LAST",
  "LAST_VALUE",
  "MAX",
  "MAX_BY",
  "MEAN",
  "MIN",
  "MIN_BY",
  "PERCENTILE",
  "PERCENTILE",
  "PERCENTILE_APPROX",
  "SKEWNESS",
  // 'SOME',
  "STD",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "SUM",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#window-functions
  "CUME_DIST",
  "DENSE_RANK",
  "LAG",
  "LEAD",
  "NTH_VALUE",
  "NTILE",
  "PERCENT_RANK",
  "RANK",
  "ROW_NUMBER",
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#array-functions
  "ARRAY",
  "ARRAY_CONTAINS",
  "ARRAY_DISTINCT",
  "ARRAY_EXCEPT",
  "ARRAY_INTERSECT",
  "ARRAY_JOIN",
  "ARRAY_MAX",
  "ARRAY_MIN",
  "ARRAY_POSITION",
  "ARRAY_REMOVE",
  "ARRAY_REPEAT",
  "ARRAY_UNION",
  "ARRAYS_OVERLAP",
  "ARRAYS_ZIP",
  "FLATTEN",
  "SEQUENCE",
  "SHUFFLE",
  "SLICE",
  "SORT_ARRAY",
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#map-functions
  "ELEMENT_AT",
  "ELEMENT_AT",
  "MAP_CONCAT",
  "MAP_ENTRIES",
  "MAP_FROM_ARRAYS",
  "MAP_FROM_ENTRIES",
  "MAP_KEYS",
  "MAP_VALUES",
  "STR_TO_MAP",
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#date-and-timestamp-functions
  "ADD_MONTHS",
  "CURRENT_DATE",
  "CURRENT_DATE",
  "CURRENT_TIMESTAMP",
  "CURRENT_TIMESTAMP",
  "CURRENT_TIMEZONE",
  "DATE_ADD",
  "DATE_FORMAT",
  "DATE_FROM_UNIX_DATE",
  "DATE_PART",
  "DATE_SUB",
  "DATE_TRUNC",
  "DATEDIFF",
  "DAY",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "EXTRACT",
  "FROM_UNIXTIME",
  "FROM_UTC_TIMESTAMP",
  "HOUR",
  "LAST_DAY",
  "MAKE_DATE",
  "MAKE_DT_INTERVAL",
  "MAKE_INTERVAL",
  "MAKE_TIMESTAMP",
  "MAKE_YM_INTERVAL",
  "MINUTE",
  "MONTH",
  "MONTHS_BETWEEN",
  "NEXT_DAY",
  "NOW",
  "QUARTER",
  "SECOND",
  "SESSION_WINDOW",
  "TIMESTAMP_MICROS",
  "TIMESTAMP_MILLIS",
  "TIMESTAMP_SECONDS",
  "TO_DATE",
  "TO_TIMESTAMP",
  "TO_UNIX_TIMESTAMP",
  "TO_UTC_TIMESTAMP",
  "TRUNC",
  "UNIX_DATE",
  "UNIX_MICROS",
  "UNIX_MILLIS",
  "UNIX_SECONDS",
  "UNIX_TIMESTAMP",
  "WEEKDAY",
  "WEEKOFYEAR",
  "WINDOW",
  "YEAR",
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#json-functions
  "FROM_JSON",
  "GET_JSON_OBJECT",
  "JSON_ARRAY_LENGTH",
  "JSON_OBJECT_KEYS",
  "JSON_TUPLE",
  "SCHEMA_OF_JSON",
  "TO_JSON",
  // http://spark.apache.org/docs/latest/api/sql/index.html
  "ABS",
  "ACOS",
  "ACOSH",
  "AGGREGATE",
  "ARRAY_SORT",
  "ASCII",
  "ASIN",
  "ASINH",
  "ASSERT_TRUE",
  "ATAN",
  "ATAN2",
  "ATANH",
  "BASE64",
  "BIN",
  "BIT_COUNT",
  "BIT_GET",
  "BIT_LENGTH",
  "BROUND",
  "BTRIM",
  "CARDINALITY",
  "CBRT",
  "CEIL",
  "CEILING",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "CHR",
  "CONCAT",
  "CONCAT_WS",
  "CONV",
  "COS",
  "COSH",
  "COT",
  "CRC32",
  "CURRENT_CATALOG",
  "CURRENT_DATABASE",
  "CURRENT_USER",
  "DEGREES",
  // 'E',
  "ELT",
  "EXP",
  "EXPM1",
  "FACTORIAL",
  "FIND_IN_SET",
  "FLOOR",
  "FORALL",
  "FORMAT_NUMBER",
  "FORMAT_STRING",
  "FROM_CSV",
  "GETBIT",
  "HASH",
  "HEX",
  "HYPOT",
  "INITCAP",
  "INLINE",
  "INLINE_OUTER",
  "INPUT_FILE_BLOCK_LENGTH",
  "INPUT_FILE_BLOCK_START",
  "INPUT_FILE_NAME",
  "INSTR",
  "ISNAN",
  "ISNOTNULL",
  "ISNULL",
  "JAVA_METHOD",
  "LCASE",
  "LEFT",
  "LENGTH",
  "LEVENSHTEIN",
  "LN",
  "LOCATE",
  "LOG",
  "LOG10",
  "LOG1P",
  "LOG2",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MAP_FILTER",
  "MAP_ZIP_WITH",
  "MD5",
  "MOD",
  "MONOTONICALLY_INCREASING_ID",
  "NAMED_STRUCT",
  "NANVL",
  "NEGATIVE",
  "NVL",
  "NVL2",
  "OCTET_LENGTH",
  "OVERLAY",
  "PARSE_URL",
  "PI",
  "PMOD",
  "POSEXPLODE",
  "POSEXPLODE_OUTER",
  "POSITION",
  "POSITIVE",
  "POW",
  "POWER",
  "PRINTF",
  "RADIANS",
  "RAISE_ERROR",
  "RAND",
  "RANDN",
  "RANDOM",
  "REFLECT",
  "REGEXP_EXTRACT",
  "REGEXP_EXTRACT_ALL",
  "REGEXP_LIKE",
  "REGEXP_REPLACE",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "RIGHT",
  "RINT",
  "ROUND",
  "RPAD",
  "RTRIM",
  "SCHEMA_OF_CSV",
  "SENTENCES",
  "SHA",
  "SHA1",
  "SHA2",
  "SHIFTLEFT",
  "SHIFTRIGHT",
  "SHIFTRIGHTUNSIGNED",
  "SIGN",
  "SIGNUM",
  "SIN",
  "SINH",
  "SOUNDEX",
  "SPACE",
  "SPARK_PARTITION_ID",
  "SPLIT",
  "SQRT",
  "STACK",
  "SUBSTR",
  "SUBSTRING",
  "SUBSTRING_INDEX",
  "TAN",
  "TANH",
  "TO_CSV",
  "TRANSFORM_KEYS",
  "TRANSFORM_VALUES",
  "TRANSLATE",
  "TRIM",
  "TRY_ADD",
  "TRY_DIVIDE",
  "TYPEOF",
  "UCASE",
  "UNBASE64",
  "UNHEX",
  "UPPER",
  "UUID",
  "VERSION",
  "WIDTH_BUCKET",
  "XPATH",
  "XPATH_BOOLEAN",
  "XPATH_DOUBLE",
  "XPATH_FLOAT",
  "XPATH_INT",
  "XPATH_LONG",
  "XPATH_NUMBER",
  "XPATH_SHORT",
  "XPATH_STRING",
  "XXHASH64",
  "ZIP_WITH",
  // cast
  "CAST",
  // Shorthand functions to use in place of CASE expression
  "COALESCE",
  "NULLIF"
];

// node_modules/sql-formatter/dist/esm/languages/spark/spark.formatter.js
var reservedSelect14 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses14 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "SORT BY",
  "CLUSTER BY",
  "DISTRIBUTE BY",
  "LIMIT",
  // Data manipulation
  // - insert:
  "INSERT [INTO | OVERWRITE] [TABLE]",
  "VALUES",
  // - insert overwrite directory:
  //   https://spark.apache.org/docs/latest/sql-ref-syntax-dml-insert-overwrite-directory.html
  "INSERT OVERWRITE [LOCAL] DIRECTORY",
  // - load:
  //   https://spark.apache.org/docs/latest/sql-ref-syntax-dml-load.html
  "LOAD DATA [LOCAL] INPATH",
  "[OVERWRITE] INTO TABLE"
]);
var standardOnelineClauses13 = expandPhrases(["CREATE [EXTERNAL] TABLE [IF NOT EXISTS]"]);
var tabularOnelineClauses13 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [GLOBAL TEMPORARY | TEMPORARY] VIEW [IF NOT EXISTS]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD COLUMNS",
  "DROP {COLUMN | COLUMNS}",
  "RENAME TO",
  "RENAME COLUMN",
  "ALTER COLUMN",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "LATERAL VIEW",
  "ALTER DATABASE",
  "ALTER VIEW",
  "CREATE DATABASE",
  "CREATE FUNCTION",
  "DROP DATABASE",
  "DROP FUNCTION",
  "DROP VIEW",
  "REPAIR TABLE",
  "USE DATABASE",
  // Data Retrieval
  "TABLESAMPLE",
  "PIVOT",
  "TRANSFORM",
  "EXPLAIN",
  // Auxiliary
  "ADD FILE",
  "ADD JAR",
  "ANALYZE TABLE",
  "CACHE TABLE",
  "CLEAR CACHE",
  "DESCRIBE DATABASE",
  "DESCRIBE FUNCTION",
  "DESCRIBE QUERY",
  "DESCRIBE TABLE",
  "LIST FILE",
  "LIST JAR",
  "REFRESH",
  "REFRESH TABLE",
  "REFRESH FUNCTION",
  "RESET",
  "SHOW COLUMNS",
  "SHOW CREATE TABLE",
  "SHOW DATABASES",
  "SHOW FUNCTIONS",
  "SHOW PARTITIONS",
  "SHOW TABLE EXTENDED",
  "SHOW TABLES",
  "SHOW TBLPROPERTIES",
  "SHOW VIEWS",
  "UNCACHE TABLE"
]);
var reservedSetOperations14 = expandPhrases([
  "UNION [ALL | DISTINCT]",
  "EXCEPT [ALL | DISTINCT]",
  "INTERSECT [ALL | DISTINCT]"
]);
var reservedJoins14 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN",
  // non-standard-joins
  "[LEFT] {ANTI | SEMI} JOIN",
  "NATURAL [LEFT] {ANTI | SEMI} JOIN"
]);
var reservedKeywordPhrases13 = expandPhrases([
  "ON DELETE",
  "ON UPDATE",
  "CURRENT ROW",
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases13 = expandPhrases([]);
var spark = {
  name: "spark",
  tokenizerOptions: {
    reservedSelect: reservedSelect14,
    reservedClauses: [...reservedClauses14, ...standardOnelineClauses13, ...tabularOnelineClauses13],
    reservedSetOperations: reservedSetOperations14,
    reservedJoins: reservedJoins14,
    reservedKeywordPhrases: reservedKeywordPhrases13,
    reservedDataTypePhrases: reservedDataTypePhrases13,
    supportsXor: true,
    reservedKeywords: keywords14,
    reservedDataTypes: dataTypes14,
    reservedFunctionNames: functions14,
    extraParens: ["[]"],
    stringTypes: [
      "''-bs",
      '""-bs',
      { quote: "''-raw", prefixes: ["R", "X"], requirePrefix: true },
      { quote: '""-raw', prefixes: ["R", "X"], requirePrefix: true }
    ],
    identTypes: ["``"],
    identChars: { allowFirstCharNumber: true },
    variableTypes: [{ quote: "{}", prefixes: ["$"], requirePrefix: true }],
    operators: ["%", "~", "^", "|", "&", "<=>", "==", "!", "||", "->"],
    postProcess: postProcess5
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses13, ...tabularOnelineClauses13],
    tabularOnelineClauses: tabularOnelineClauses13
  }
};
function postProcess5(tokens) {
  return tokens.map((token, i) => {
    const prevToken = tokens[i - 1] || EOF_TOKEN;
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.WINDOW(token) && nextToken.type === TokenType.OPEN_PAREN) {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_FUNCTION_NAME });
    }
    if (token.text === "ITEMS" && token.type === TokenType.RESERVED_KEYWORD) {
      if (!(prevToken.text === "COLLECTION" && nextToken.text === "TERMINATED")) {
        return Object.assign(Object.assign({}, token), { type: TokenType.IDENTIFIER, text: token.raw });
      }
    }
    return token;
  });
}

// node_modules/sql-formatter/dist/esm/languages/sqlite/sqlite.functions.js
var functions15 = [
  // https://www.sqlite.org/lang_corefunc.html
  "ABS",
  "CHANGES",
  "CHAR",
  "COALESCE",
  "FORMAT",
  "GLOB",
  "HEX",
  "IFNULL",
  "IIF",
  "INSTR",
  "LAST_INSERT_ROWID",
  "LENGTH",
  "LIKE",
  "LIKELIHOOD",
  "LIKELY",
  "LOAD_EXTENSION",
  "LOWER",
  "LTRIM",
  "NULLIF",
  "PRINTF",
  "QUOTE",
  "RANDOM",
  "RANDOMBLOB",
  "REPLACE",
  "ROUND",
  "RTRIM",
  "SIGN",
  "SOUNDEX",
  "SQLITE_COMPILEOPTION_GET",
  "SQLITE_COMPILEOPTION_USED",
  "SQLITE_OFFSET",
  "SQLITE_SOURCE_ID",
  "SQLITE_VERSION",
  "SUBSTR",
  "SUBSTRING",
  "TOTAL_CHANGES",
  "TRIM",
  "TYPEOF",
  "UNICODE",
  "UNLIKELY",
  "UPPER",
  "ZEROBLOB",
  // https://www.sqlite.org/lang_aggfunc.html
  "AVG",
  "COUNT",
  "GROUP_CONCAT",
  "MAX",
  "MIN",
  "SUM",
  "TOTAL",
  // https://www.sqlite.org/lang_datefunc.html
  "DATE",
  "TIME",
  "DATETIME",
  "JULIANDAY",
  "UNIXEPOCH",
  "STRFTIME",
  // https://www.sqlite.org/windowfunctions.html#biwinfunc
  "row_number",
  "rank",
  "dense_rank",
  "percent_rank",
  "cume_dist",
  "ntile",
  "lag",
  "lead",
  "first_value",
  "last_value",
  "nth_value",
  // https://www.sqlite.org/lang_mathfunc.html
  "ACOS",
  "ACOSH",
  "ASIN",
  "ASINH",
  "ATAN",
  "ATAN2",
  "ATANH",
  "CEIL",
  "CEILING",
  "COS",
  "COSH",
  "DEGREES",
  "EXP",
  "FLOOR",
  "LN",
  "LOG",
  "LOG",
  "LOG10",
  "LOG2",
  "MOD",
  "PI",
  "POW",
  "POWER",
  "RADIANS",
  "SIN",
  "SINH",
  "SQRT",
  "TAN",
  "TANH",
  "TRUNC",
  // https://www.sqlite.org/json1.html
  "JSON",
  "JSON_ARRAY",
  "JSON_ARRAY_LENGTH",
  "JSON_ARRAY_LENGTH",
  "JSON_EXTRACT",
  "JSON_INSERT",
  "JSON_OBJECT",
  "JSON_PATCH",
  "JSON_REMOVE",
  "JSON_REPLACE",
  "JSON_SET",
  "JSON_TYPE",
  "JSON_TYPE",
  "JSON_VALID",
  "JSON_QUOTE",
  "JSON_GROUP_ARRAY",
  "JSON_GROUP_OBJECT",
  "JSON_EACH",
  "JSON_TREE",
  // cast
  "CAST"
];

// node_modules/sql-formatter/dist/esm/languages/sqlite/sqlite.keywords.js
var keywords15 = [
  // https://www.sqlite.org/lang_keywords.html
  // Note: The keywords listed on that URL are not all reserved keywords.
  // We'll need to clean up this list to only include reserved keywords.
  "ABORT",
  "ACTION",
  "ADD",
  "AFTER",
  "ALL",
  "ALTER",
  "AND",
  "ARE",
  "ALWAYS",
  "ANALYZE",
  "AS",
  "ASC",
  "ATTACH",
  "AUTOINCREMENT",
  "BEFORE",
  "BEGIN",
  "BETWEEN",
  "BY",
  "CASCADE",
  "CASE",
  "CAST",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "COMMIT",
  "CONFLICT",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "DATABASE",
  "DEFAULT",
  "DEFERRABLE",
  "DEFERRED",
  "DELETE",
  "DESC",
  "DETACH",
  "DISTINCT",
  "DO",
  "DROP",
  "EACH",
  "ELSE",
  "END",
  "ESCAPE",
  "EXCEPT",
  "EXCLUDE",
  "EXCLUSIVE",
  "EXISTS",
  "EXPLAIN",
  "FAIL",
  "FILTER",
  "FIRST",
  "FOLLOWING",
  "FOR",
  "FOREIGN",
  "FROM",
  "FULL",
  "GENERATED",
  "GLOB",
  "GROUP",
  "HAVING",
  "IF",
  "IGNORE",
  "IMMEDIATE",
  "IN",
  "INDEX",
  "INDEXED",
  "INITIALLY",
  "INNER",
  "INSERT",
  "INSTEAD",
  "INTERSECT",
  "INTO",
  "IS",
  "ISNULL",
  "JOIN",
  "KEY",
  "LAST",
  "LEFT",
  "LIKE",
  "LIMIT",
  "MATCH",
  "MATERIALIZED",
  "NATURAL",
  "NO",
  "NOT",
  "NOTHING",
  "NOTNULL",
  "NULL",
  "NULLS",
  "OF",
  "OFFSET",
  "ON",
  "ONLY",
  "OPEN",
  "OR",
  "ORDER",
  "OTHERS",
  "OUTER",
  "OVER",
  "PARTITION",
  "PLAN",
  "PRAGMA",
  "PRECEDING",
  "PRIMARY",
  "QUERY",
  "RAISE",
  "RANGE",
  "RECURSIVE",
  "REFERENCES",
  "REGEXP",
  "REINDEX",
  "RELEASE",
  "RENAME",
  "REPLACE",
  "RESTRICT",
  "RETURNING",
  "RIGHT",
  "ROLLBACK",
  "ROW",
  "ROWS",
  "SAVEPOINT",
  "SELECT",
  "SET",
  "TABLE",
  "TEMP",
  "TEMPORARY",
  "THEN",
  "TIES",
  "TO",
  "TRANSACTION",
  "TRIGGER",
  "UNBOUNDED",
  "UNION",
  "UNIQUE",
  "UPDATE",
  "USING",
  "VACUUM",
  "VALUES",
  "VIEW",
  "VIRTUAL",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITHOUT"
];
var dataTypes15 = [
  // SQLite allows any word as a data type, e.g. CREATE TABLE foo (col1 madeupname(123));
  // Here we just list some common ones as SQL Formatter
  // is only able to detect a predefined list of data types.
  // https://www.sqlite.org/stricttables.html
  // https://www.sqlite.org/datatype3.html
  "ANY",
  "ARRAY",
  "BLOB",
  "CHARACTER",
  "DECIMAL",
  "INT",
  "INTEGER",
  "NATIVE CHARACTER",
  "NCHAR",
  "NUMERIC",
  "NVARCHAR",
  "REAL",
  "TEXT",
  "VARCHAR",
  "VARYING CHARACTER"
];

// node_modules/sql-formatter/dist/esm/languages/sqlite/sqlite.formatter.js
var reservedSelect15 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses15 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [OR ABORT | OR FAIL | OR IGNORE | OR REPLACE | OR ROLLBACK] INTO",
  "REPLACE INTO",
  "VALUES",
  // - update:
  "SET",
  // other:
  "RETURNING"
]);
var standardOnelineClauses14 = expandPhrases(["CREATE [TEMPORARY | TEMP] TABLE [IF NOT EXISTS]"]);
var tabularOnelineClauses14 = expandPhrases([
  // - create:
  "CREATE [TEMPORARY | TEMP] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE [OR ABORT | OR FAIL | OR IGNORE | OR REPLACE | OR ROLLBACK]",
  // - insert:
  "ON CONFLICT",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "DROP [COLUMN]",
  "RENAME [COLUMN]",
  "RENAME TO",
  // - set schema
  "SET SCHEMA"
]);
var reservedSetOperations15 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT"]);
var reservedJoins15 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"
]);
var reservedKeywordPhrases14 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]",
  "{ROWS | RANGE | GROUPS} BETWEEN",
  "DO UPDATE"
]);
var reservedDataTypePhrases14 = expandPhrases([]);
var sqlite = {
  name: "sqlite",
  tokenizerOptions: {
    reservedSelect: reservedSelect15,
    reservedClauses: [...reservedClauses15, ...standardOnelineClauses14, ...tabularOnelineClauses14],
    reservedSetOperations: reservedSetOperations15,
    reservedJoins: reservedJoins15,
    reservedKeywordPhrases: reservedKeywordPhrases14,
    reservedDataTypePhrases: reservedDataTypePhrases14,
    reservedKeywords: keywords15,
    reservedDataTypes: dataTypes15,
    reservedFunctionNames: functions15,
    stringTypes: [
      "''-qq",
      { quote: "''-raw", prefixes: ["X"], requirePrefix: true }
      // Depending on context SQLite also supports double-quotes for strings,
      // and single-quotes for identifiers.
    ],
    identTypes: [`""-qq`, "``", "[]"],
    // https://www.sqlite.org/lang_expr.html#parameters
    paramTypes: { positional: true, numbered: ["?"], named: [":", "@", "$"] },
    operators: ["%", "~", "&", "|", "<<", ">>", "==", "->", "->>", "||"]
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses14, ...tabularOnelineClauses14],
    tabularOnelineClauses: tabularOnelineClauses14
  }
};

// node_modules/sql-formatter/dist/esm/languages/sql/sql.functions.js
var functions16 = [
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_9_set_function_specification
  "GROUPING",
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_10_window_function
  "RANK",
  "DENSE_RANK",
  "PERCENT_RANK",
  "CUME_DIST",
  "ROW_NUMBER",
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_27_numeric_value_function
  "POSITION",
  "OCCURRENCES_REGEX",
  "POSITION_REGEX",
  "EXTRACT",
  "CHAR_LENGTH",
  "CHARACTER_LENGTH",
  "OCTET_LENGTH",
  "CARDINALITY",
  "ABS",
  "MOD",
  "LN",
  "EXP",
  "POWER",
  "SQRT",
  "FLOOR",
  "CEIL",
  "CEILING",
  "WIDTH_BUCKET",
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_29_string_value_function
  "SUBSTRING",
  "SUBSTRING_REGEX",
  "UPPER",
  "LOWER",
  "CONVERT",
  "TRANSLATE",
  "TRANSLATE_REGEX",
  "TRIM",
  "OVERLAY",
  "NORMALIZE",
  "SPECIFICTYPE",
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_31_datetime_value_function
  "CURRENT_DATE",
  "CURRENT_TIME",
  "LOCALTIME",
  "CURRENT_TIMESTAMP",
  "LOCALTIMESTAMP",
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_38_multiset_value_function
  // SET serves multiple roles: a SET() function and a SET keyword e.g. in UPDATE table SET ...
  // multiset
  // 'SET', (disabled for now)
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_10_9_aggregate_function
  "COUNT",
  "AVG",
  "MAX",
  "MIN",
  "SUM",
  // 'EVERY',
  // 'ANY',
  // 'SOME',
  "STDDEV_POP",
  "STDDEV_SAMP",
  "VAR_SAMP",
  "VAR_POP",
  "COLLECT",
  "FUSION",
  "INTERSECTION",
  "COVAR_POP",
  "COVAR_SAMP",
  "CORR",
  "REGR_SLOPE",
  "REGR_INTERCEPT",
  "REGR_COUNT",
  "REGR_R2",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_SXX",
  "REGR_SYY",
  "REGR_SXY",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  // CAST is a pretty complex case, involving multiple forms:
  // - CAST(col AS int)
  // - CAST(...) WITH ...
  // - CAST FROM int
  // - CREATE CAST(mycol AS int) WITH ...
  "CAST",
  // Shorthand functions to use in place of CASE expression
  "COALESCE",
  "NULLIF",
  // Non-standard functions that have widespread support
  "ROUND",
  "SIN",
  "COS",
  "TAN",
  "ASIN",
  "ACOS",
  "ATAN"
];

// node_modules/sql-formatter/dist/esm/languages/sql/sql.keywords.js
var keywords16 = [
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#reserved-word
  "ALL",
  "ALLOCATE",
  "ALTER",
  "ANY",
  "ARE",
  "AS",
  "ASC",
  "ASENSITIVE",
  "ASYMMETRIC",
  "AT",
  "ATOMIC",
  "AUTHORIZATION",
  "BEGIN",
  "BETWEEN",
  "BOTH",
  "BY",
  "CALL",
  "CALLED",
  "CASCADED",
  "CAST",
  "CHECK",
  "CLOSE",
  "COALESCE",
  "COLLATE",
  "COLUMN",
  "COMMIT",
  "CONDITION",
  "CONNECT",
  "CONSTRAINT",
  "CORRESPONDING",
  "CREATE",
  "CROSS",
  "CUBE",
  "CURRENT",
  "CURRENT_CATALOG",
  "CURRENT_DEFAULT_TRANSFORM_GROUP",
  "CURRENT_PATH",
  "CURRENT_ROLE",
  "CURRENT_SCHEMA",
  "CURRENT_TRANSFORM_GROUP_FOR_TYPE",
  "CURRENT_USER",
  "CURSOR",
  "CYCLE",
  "DEALLOCATE",
  "DAY",
  "DECLARE",
  "DEFAULT",
  "DELETE",
  "DEREF",
  "DESC",
  "DESCRIBE",
  "DETERMINISTIC",
  "DISCONNECT",
  "DISTINCT",
  "DROP",
  "DYNAMIC",
  "EACH",
  "ELEMENT",
  "END-EXEC",
  "ESCAPE",
  "EVERY",
  "EXCEPT",
  "EXEC",
  "EXECUTE",
  "EXISTS",
  "EXTERNAL",
  "FALSE",
  "FETCH",
  "FILTER",
  "FOR",
  "FOREIGN",
  "FREE",
  "FROM",
  "FULL",
  "FUNCTION",
  "GET",
  "GLOBAL",
  "GRANT",
  "GROUP",
  "HAVING",
  "HOLD",
  "HOUR",
  "IDENTITY",
  "IN",
  "INDICATOR",
  "INNER",
  "INOUT",
  "INSENSITIVE",
  "INSERT",
  "INTERSECT",
  "INTO",
  "IS",
  "LANGUAGE",
  "LARGE",
  "LATERAL",
  "LEADING",
  "LEFT",
  "LIKE",
  "LIKE_REGEX",
  "LOCAL",
  "MATCH",
  "MEMBER",
  "MERGE",
  "METHOD",
  "MINUTE",
  "MODIFIES",
  "MODULE",
  "MONTH",
  "NATURAL",
  "NEW",
  "NO",
  "NONE",
  "NOT",
  "NULL",
  "NULLIF",
  "OF",
  "OLD",
  "ON",
  "ONLY",
  "OPEN",
  "ORDER",
  "OUT",
  "OUTER",
  "OVER",
  "OVERLAPS",
  "PARAMETER",
  "PARTITION",
  "PRECISION",
  "PREPARE",
  "PRIMARY",
  "PROCEDURE",
  "RANGE",
  "READS",
  "REAL",
  "RECURSIVE",
  "REF",
  "REFERENCES",
  "REFERENCING",
  "RELEASE",
  "RESULT",
  "RETURN",
  "RETURNS",
  "REVOKE",
  "RIGHT",
  "ROLLBACK",
  "ROLLUP",
  "ROW",
  "ROWS",
  "SAVEPOINT",
  "SCOPE",
  "SCROLL",
  "SEARCH",
  "SECOND",
  "SELECT",
  "SENSITIVE",
  "SESSION_USER",
  "SET",
  "SIMILAR",
  "SOME",
  "SPECIFIC",
  "SQL",
  "SQLEXCEPTION",
  "SQLSTATE",
  "SQLWARNING",
  "START",
  "STATIC",
  "SUBMULTISET",
  "SYMMETRIC",
  "SYSTEM",
  "SYSTEM_USER",
  "TABLE",
  "TABLESAMPLE",
  "THEN",
  "TIMEZONE_HOUR",
  "TIMEZONE_MINUTE",
  "TO",
  "TRAILING",
  "TRANSLATION",
  "TREAT",
  "TRIGGER",
  "TRUE",
  "UESCAPE",
  "UNION",
  "UNIQUE",
  "UNKNOWN",
  "UNNEST",
  "UPDATE",
  "USER",
  "USING",
  "VALUE",
  "VALUES",
  "WHENEVER",
  "WINDOW",
  "WITHIN",
  "WITHOUT",
  "YEAR"
];
var dataTypes16 = [
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_1_data_type
  "ARRAY",
  "BIGINT",
  "BINARY LARGE OBJECT",
  "BINARY VARYING",
  "BINARY",
  "BLOB",
  "BOOLEAN",
  "CHAR LARGE OBJECT",
  "CHAR VARYING",
  "CHAR",
  "CHARACTER LARGE OBJECT",
  "CHARACTER VARYING",
  "CHARACTER",
  "CLOB",
  "DATE",
  "DEC",
  "DECIMAL",
  "DOUBLE",
  "FLOAT",
  "INT",
  "INTEGER",
  "INTERVAL",
  "MULTISET",
  "NATIONAL CHAR VARYING",
  "NATIONAL CHAR",
  "NATIONAL CHARACTER LARGE OBJECT",
  "NATIONAL CHARACTER VARYING",
  "NATIONAL CHARACTER",
  "NCHAR LARGE OBJECT",
  "NCHAR VARYING",
  "NCHAR",
  "NCLOB",
  "NUMERIC",
  "SMALLINT",
  "TIME",
  "TIMESTAMP",
  "VARBINARY",
  "VARCHAR"
];

// node_modules/sql-formatter/dist/esm/languages/sql/sql.formatter.js
var reservedSelect16 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses16 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL | DISTINCT]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET"
]);
var standardOnelineClauses15 = expandPhrases(["CREATE [GLOBAL TEMPORARY | LOCAL TEMPORARY] TABLE"]);
var tabularOnelineClauses15 = expandPhrases([
  // - create:
  "CREATE [RECURSIVE] VIEW",
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE",
  // - alter table:
  "ALTER TABLE",
  "ADD COLUMN",
  "DROP [COLUMN]",
  "RENAME COLUMN",
  "RENAME TO",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  "ADD SCOPE",
  "DROP SCOPE {CASCADE | RESTRICT}",
  "RESTART WITH",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "SET SCHEMA"
]);
var reservedSetOperations16 = expandPhrases([
  "UNION [ALL | DISTINCT]",
  "EXCEPT [ALL | DISTINCT]",
  "INTERSECT [ALL | DISTINCT]"
]);
var reservedJoins16 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"
]);
var reservedKeywordPhrases15 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]",
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases15 = expandPhrases([]);
var sql = {
  name: "sql",
  tokenizerOptions: {
    reservedSelect: reservedSelect16,
    reservedClauses: [...reservedClauses16, ...standardOnelineClauses15, ...tabularOnelineClauses15],
    reservedSetOperations: reservedSetOperations16,
    reservedJoins: reservedJoins16,
    reservedKeywordPhrases: reservedKeywordPhrases15,
    reservedDataTypePhrases: reservedDataTypePhrases15,
    reservedKeywords: keywords16,
    reservedDataTypes: dataTypes16,
    reservedFunctionNames: functions16,
    stringTypes: [
      { quote: "''-qq-bs", prefixes: ["N", "U&"] },
      { quote: "''-raw", prefixes: ["X"], requirePrefix: true }
    ],
    identTypes: [`""-qq`, "``"],
    paramTypes: { positional: true },
    operators: ["||"]
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses15, ...tabularOnelineClauses15],
    tabularOnelineClauses: tabularOnelineClauses15
  }
};

// node_modules/sql-formatter/dist/esm/languages/trino/trino.functions.js
var functions17 = [
  // https://github.com/trinodb/trino/tree/432d2897bdef99388c1a47188743a061c4ac1f34/docs/src/main/sphinx/functions
  // rg '^\.\. function::' ./docs/src/main/sphinx/functions | cut -d' ' -f 3 | cut -d '(' -f 1 | sort | uniq
  // rg '\* ' ./docs/src/main/sphinx/functions/list-by-topic.rst | grep    '\* :func:' | cut -d'`' -f 2
  // rg '\* ' ./docs/src/main/sphinx/functions/list-by-topic.rst | grep -v '\* :func:'
  // grep -e '^- ' ./docs/src/main/sphinx/functions/list.rst | grep  -e '^- :func:' | cut -d'`' -f2
  // grep -e '^- ' ./docs/src/main/sphinx/functions/list.rst | grep -ve '^- :func:'
  "ABS",
  "ACOS",
  "ALL_MATCH",
  "ANY_MATCH",
  "APPROX_DISTINCT",
  "APPROX_MOST_FREQUENT",
  "APPROX_PERCENTILE",
  "APPROX_SET",
  "ARBITRARY",
  "ARRAYS_OVERLAP",
  "ARRAY_AGG",
  "ARRAY_DISTINCT",
  "ARRAY_EXCEPT",
  "ARRAY_INTERSECT",
  "ARRAY_JOIN",
  "ARRAY_MAX",
  "ARRAY_MIN",
  "ARRAY_POSITION",
  "ARRAY_REMOVE",
  "ARRAY_SORT",
  "ARRAY_UNION",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AT_TIMEZONE",
  "AVG",
  "BAR",
  "BETA_CDF",
  "BING_TILE",
  "BING_TILES_AROUND",
  "BING_TILE_AT",
  "BING_TILE_COORDINATES",
  "BING_TILE_POLYGON",
  "BING_TILE_QUADKEY",
  "BING_TILE_ZOOM_LEVEL",
  "BITWISE_AND",
  "BITWISE_AND_AGG",
  "BITWISE_LEFT_SHIFT",
  "BITWISE_NOT",
  "BITWISE_OR",
  "BITWISE_OR_AGG",
  "BITWISE_RIGHT_SHIFT",
  "BITWISE_RIGHT_SHIFT_ARITHMETIC",
  "BITWISE_XOR",
  "BIT_COUNT",
  "BOOL_AND",
  "BOOL_OR",
  "CARDINALITY",
  "CAST",
  "CBRT",
  "CEIL",
  "CEILING",
  "CHAR2HEXINT",
  "CHECKSUM",
  "CHR",
  "CLASSIFY",
  "COALESCE",
  "CODEPOINT",
  "COLOR",
  "COMBINATIONS",
  "CONCAT",
  "CONCAT_WS",
  "CONTAINS",
  "CONTAINS_SEQUENCE",
  "CONVEX_HULL_AGG",
  "CORR",
  "COS",
  "COSH",
  "COSINE_SIMILARITY",
  "COUNT",
  "COUNT_IF",
  "COVAR_POP",
  "COVAR_SAMP",
  "CRC32",
  "CUME_DIST",
  "CURRENT_CATALOG",
  "CURRENT_DATE",
  "CURRENT_GROUPS",
  "CURRENT_SCHEMA",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_TIMEZONE",
  "CURRENT_USER",
  "DATE",
  "DATE_ADD",
  "DATE_DIFF",
  "DATE_FORMAT",
  "DATE_PARSE",
  "DATE_TRUNC",
  "DAY",
  "DAY_OF_MONTH",
  "DAY_OF_WEEK",
  "DAY_OF_YEAR",
  "DEGREES",
  "DENSE_RANK",
  "DOW",
  "DOY",
  "E",
  "ELEMENT_AT",
  "EMPTY_APPROX_SET",
  "EVALUATE_CLASSIFIER_PREDICTIONS",
  "EVERY",
  "EXP",
  "EXTRACT",
  "FEATURES",
  "FILTER",
  "FIRST_VALUE",
  "FLATTEN",
  "FLOOR",
  "FORMAT",
  "FORMAT_DATETIME",
  "FORMAT_NUMBER",
  "FROM_BASE",
  "FROM_BASE32",
  "FROM_BASE64",
  "FROM_BASE64URL",
  "FROM_BIG_ENDIAN_32",
  "FROM_BIG_ENDIAN_64",
  "FROM_ENCODED_POLYLINE",
  "FROM_GEOJSON_GEOMETRY",
  "FROM_HEX",
  "FROM_IEEE754_32",
  "FROM_IEEE754_64",
  "FROM_ISO8601_DATE",
  "FROM_ISO8601_TIMESTAMP",
  "FROM_ISO8601_TIMESTAMP_NANOS",
  "FROM_UNIXTIME",
  "FROM_UNIXTIME_NANOS",
  "FROM_UTF8",
  "GEOMETRIC_MEAN",
  "GEOMETRY_FROM_HADOOP_SHAPE",
  "GEOMETRY_INVALID_REASON",
  "GEOMETRY_NEAREST_POINTS",
  "GEOMETRY_TO_BING_TILES",
  "GEOMETRY_UNION",
  "GEOMETRY_UNION_AGG",
  "GREATEST",
  "GREAT_CIRCLE_DISTANCE",
  "HAMMING_DISTANCE",
  "HASH_COUNTS",
  "HISTOGRAM",
  "HMAC_MD5",
  "HMAC_SHA1",
  "HMAC_SHA256",
  "HMAC_SHA512",
  "HOUR",
  "HUMAN_READABLE_SECONDS",
  "IF",
  "INDEX",
  "INFINITY",
  "INTERSECTION_CARDINALITY",
  "INVERSE_BETA_CDF",
  "INVERSE_NORMAL_CDF",
  "IS_FINITE",
  "IS_INFINITE",
  "IS_JSON_SCALAR",
  "IS_NAN",
  "JACCARD_INDEX",
  "JSON_ARRAY_CONTAINS",
  "JSON_ARRAY_GET",
  "JSON_ARRAY_LENGTH",
  "JSON_EXISTS",
  "JSON_EXTRACT",
  "JSON_EXTRACT_SCALAR",
  "JSON_FORMAT",
  "JSON_PARSE",
  "JSON_QUERY",
  "JSON_SIZE",
  "JSON_VALUE",
  "KURTOSIS",
  "LAG",
  "LAST_DAY_OF_MONTH",
  "LAST_VALUE",
  "LEAD",
  "LEARN_CLASSIFIER",
  "LEARN_LIBSVM_CLASSIFIER",
  "LEARN_LIBSVM_REGRESSOR",
  "LEARN_REGRESSOR",
  "LEAST",
  "LENGTH",
  "LEVENSHTEIN_DISTANCE",
  "LINE_INTERPOLATE_POINT",
  "LINE_INTERPOLATE_POINTS",
  "LINE_LOCATE_POINT",
  "LISTAGG",
  "LN",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOG",
  "LOG10",
  "LOG2",
  "LOWER",
  "LPAD",
  "LTRIM",
  "LUHN_CHECK",
  "MAKE_SET_DIGEST",
  "MAP",
  "MAP_AGG",
  "MAP_CONCAT",
  "MAP_ENTRIES",
  "MAP_FILTER",
  "MAP_FROM_ENTRIES",
  "MAP_KEYS",
  "MAP_UNION",
  "MAP_VALUES",
  "MAP_ZIP_WITH",
  "MAX",
  "MAX_BY",
  "MD5",
  "MERGE",
  "MERGE_SET_DIGEST",
  "MILLISECOND",
  "MIN",
  "MINUTE",
  "MIN_BY",
  "MOD",
  "MONTH",
  "MULTIMAP_AGG",
  "MULTIMAP_FROM_ENTRIES",
  "MURMUR3",
  "NAN",
  "NGRAMS",
  "NONE_MATCH",
  "NORMALIZE",
  "NORMAL_CDF",
  "NOW",
  "NTH_VALUE",
  "NTILE",
  "NULLIF",
  "NUMERIC_HISTOGRAM",
  "OBJECTID",
  "OBJECTID_TIMESTAMP",
  "PARSE_DATA_SIZE",
  "PARSE_DATETIME",
  "PARSE_DURATION",
  "PERCENT_RANK",
  "PI",
  "POSITION",
  "POW",
  "POWER",
  "QDIGEST_AGG",
  "QUARTER",
  "RADIANS",
  "RAND",
  "RANDOM",
  "RANK",
  "REDUCE",
  "REDUCE_AGG",
  "REGEXP_COUNT",
  "REGEXP_EXTRACT",
  "REGEXP_EXTRACT_ALL",
  "REGEXP_LIKE",
  "REGEXP_POSITION",
  "REGEXP_REPLACE",
  "REGEXP_SPLIT",
  "REGRESS",
  "REGR_INTERCEPT",
  "REGR_SLOPE",
  "RENDER",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "RGB",
  "ROUND",
  "ROW_NUMBER",
  "RPAD",
  "RTRIM",
  "SECOND",
  "SEQUENCE",
  "SHA1",
  "SHA256",
  "SHA512",
  "SHUFFLE",
  "SIGN",
  "SIMPLIFY_GEOMETRY",
  "SIN",
  "SKEWNESS",
  "SLICE",
  "SOUNDEX",
  "SPATIAL_PARTITIONING",
  "SPATIAL_PARTITIONS",
  "SPLIT",
  "SPLIT_PART",
  "SPLIT_TO_MAP",
  "SPLIT_TO_MULTIMAP",
  "SPOOKY_HASH_V2_32",
  "SPOOKY_HASH_V2_64",
  "SQRT",
  "STARTS_WITH",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STRPOS",
  "ST_AREA",
  "ST_ASBINARY",
  "ST_ASTEXT",
  "ST_BOUNDARY",
  "ST_BUFFER",
  "ST_CENTROID",
  "ST_CONTAINS",
  "ST_CONVEXHULL",
  "ST_COORDDIM",
  "ST_CROSSES",
  "ST_DIFFERENCE",
  "ST_DIMENSION",
  "ST_DISJOINT",
  "ST_DISTANCE",
  "ST_ENDPOINT",
  "ST_ENVELOPE",
  "ST_ENVELOPEASPTS",
  "ST_EQUALS",
  "ST_EXTERIORRING",
  "ST_GEOMETRIES",
  "ST_GEOMETRYFROMTEXT",
  "ST_GEOMETRYN",
  "ST_GEOMETRYTYPE",
  "ST_GEOMFROMBINARY",
  "ST_INTERIORRINGN",
  "ST_INTERIORRINGS",
  "ST_INTERSECTION",
  "ST_INTERSECTS",
  "ST_ISCLOSED",
  "ST_ISEMPTY",
  "ST_ISRING",
  "ST_ISSIMPLE",
  "ST_ISVALID",
  "ST_LENGTH",
  "ST_LINEFROMTEXT",
  "ST_LINESTRING",
  "ST_MULTIPOINT",
  "ST_NUMGEOMETRIES",
  "ST_NUMINTERIORRING",
  "ST_NUMPOINTS",
  "ST_OVERLAPS",
  "ST_POINT",
  "ST_POINTN",
  "ST_POINTS",
  "ST_POLYGON",
  "ST_RELATE",
  "ST_STARTPOINT",
  "ST_SYMDIFFERENCE",
  "ST_TOUCHES",
  "ST_UNION",
  "ST_WITHIN",
  "ST_X",
  "ST_XMAX",
  "ST_XMIN",
  "ST_Y",
  "ST_YMAX",
  "ST_YMIN",
  "SUBSTR",
  "SUBSTRING",
  "SUM",
  "TAN",
  "TANH",
  "TDIGEST_AGG",
  "TIMESTAMP_OBJECTID",
  "TIMEZONE_HOUR",
  "TIMEZONE_MINUTE",
  "TO_BASE",
  "TO_BASE32",
  "TO_BASE64",
  "TO_BASE64URL",
  "TO_BIG_ENDIAN_32",
  "TO_BIG_ENDIAN_64",
  "TO_CHAR",
  "TO_DATE",
  "TO_ENCODED_POLYLINE",
  "TO_GEOJSON_GEOMETRY",
  "TO_GEOMETRY",
  "TO_HEX",
  "TO_IEEE754_32",
  "TO_IEEE754_64",
  "TO_ISO8601",
  "TO_MILLISECONDS",
  "TO_SPHERICAL_GEOGRAPHY",
  "TO_TIMESTAMP",
  "TO_UNIXTIME",
  "TO_UTF8",
  "TRANSFORM",
  "TRANSFORM_KEYS",
  "TRANSFORM_VALUES",
  "TRANSLATE",
  "TRIM",
  "TRIM_ARRAY",
  "TRUNCATE",
  "TRY",
  "TRY_CAST",
  "TYPEOF",
  "UPPER",
  "URL_DECODE",
  "URL_ENCODE",
  "URL_EXTRACT_FRAGMENT",
  "URL_EXTRACT_HOST",
  "URL_EXTRACT_PARAMETER",
  "URL_EXTRACT_PATH",
  "URL_EXTRACT_PORT",
  "URL_EXTRACT_PROTOCOL",
  "URL_EXTRACT_QUERY",
  "UUID",
  "VALUES_AT_QUANTILES",
  "VALUE_AT_QUANTILE",
  "VARIANCE",
  "VAR_POP",
  "VAR_SAMP",
  "VERSION",
  "WEEK",
  "WEEK_OF_YEAR",
  "WIDTH_BUCKET",
  "WILSON_INTERVAL_LOWER",
  "WILSON_INTERVAL_UPPER",
  "WITH_TIMEZONE",
  "WORD_STEM",
  "XXHASH64",
  "YEAR",
  "YEAR_OF_WEEK",
  "YOW",
  "ZIP",
  "ZIP_WITH",
  // https://trino.io/docs/current/sql/match-recognize.html#row-pattern-recognition-expressions
  "CLASSIFIER",
  "FIRST",
  "LAST",
  "MATCH_NUMBER",
  "NEXT",
  "PERMUTE",
  "PREV"
];

// node_modules/sql-formatter/dist/esm/languages/trino/trino.keywords.js
var keywords17 = [
  // https://github.com/trinodb/trino/blob/432d2897bdef99388c1a47188743a061c4ac1f34/core/trino-parser/src/main/antlr4/io/trino/sql/parser/SqlBase.g4#L858-L1128
  "ABSENT",
  "ADD",
  "ADMIN",
  "AFTER",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "ANY",
  "AS",
  "ASC",
  "AT",
  "AUTHORIZATION",
  "BERNOULLI",
  "BETWEEN",
  "BOTH",
  "BY",
  "CALL",
  "CASCADE",
  "CASE",
  "CATALOGS",
  "COLUMN",
  "COLUMNS",
  "COMMENT",
  "COMMIT",
  "COMMITTED",
  "CONDITIONAL",
  "CONSTRAINT",
  "COPARTITION",
  "CREATE",
  "CROSS",
  "CUBE",
  "CURRENT",
  "CURRENT_PATH",
  "CURRENT_ROLE",
  "DATA",
  "DEALLOCATE",
  "DEFAULT",
  "DEFINE",
  "DEFINER",
  "DELETE",
  "DENY",
  "DESC",
  "DESCRIBE",
  "DESCRIPTOR",
  "DISTINCT",
  "DISTRIBUTED",
  "DOUBLE",
  "DROP",
  "ELSE",
  "EMPTY",
  "ENCODING",
  "END",
  "ERROR",
  "ESCAPE",
  "EXCEPT",
  "EXCLUDING",
  "EXECUTE",
  "EXISTS",
  "EXPLAIN",
  "FALSE",
  "FETCH",
  "FINAL",
  "FIRST",
  "FOLLOWING",
  "FOR",
  "FROM",
  "FULL",
  "FUNCTIONS",
  "GRANT",
  "GRANTED",
  "GRANTS",
  "GRAPHVIZ",
  "GROUP",
  "GROUPING",
  "GROUPS",
  "HAVING",
  "IGNORE",
  "IN",
  "INCLUDING",
  "INITIAL",
  "INNER",
  "INPUT",
  "INSERT",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "INVOKER",
  "IO",
  "IS",
  "ISOLATION",
  "JOIN",
  "JSON",
  "JSON_ARRAY",
  "JSON_OBJECT",
  "KEEP",
  "KEY",
  "KEYS",
  "LAST",
  "LATERAL",
  "LEADING",
  "LEFT",
  "LEVEL",
  "LIKE",
  "LIMIT",
  "LOCAL",
  "LOGICAL",
  "MATCH",
  "MATCHED",
  "MATCHES",
  "MATCH_RECOGNIZE",
  "MATERIALIZED",
  "MEASURES",
  "NATURAL",
  "NEXT",
  "NFC",
  "NFD",
  "NFKC",
  "NFKD",
  "NO",
  "NONE",
  "NOT",
  "NULL",
  "NULLS",
  "OBJECT",
  "OF",
  "OFFSET",
  "OMIT",
  "ON",
  "ONE",
  "ONLY",
  "OPTION",
  "OR",
  "ORDER",
  "ORDINALITY",
  "OUTER",
  "OUTPUT",
  "OVER",
  "OVERFLOW",
  "PARTITION",
  "PARTITIONS",
  "PASSING",
  "PAST",
  "PATH",
  "PATTERN",
  "PER",
  "PERMUTE",
  "PRECEDING",
  "PRECISION",
  "PREPARE",
  "PRIVILEGES",
  "PROPERTIES",
  "PRUNE",
  "QUOTES",
  "RANGE",
  "READ",
  "RECURSIVE",
  "REFRESH",
  "RENAME",
  "REPEATABLE",
  "RESET",
  "RESPECT",
  "RESTRICT",
  "RETURNING",
  "REVOKE",
  "RIGHT",
  "ROLE",
  "ROLES",
  "ROLLBACK",
  "ROLLUP",
  "ROW",
  "ROWS",
  "RUNNING",
  "SCALAR",
  "SCHEMA",
  "SCHEMAS",
  "SECURITY",
  "SEEK",
  "SELECT",
  "SERIALIZABLE",
  "SESSION",
  "SET",
  "SETS",
  "SHOW",
  "SKIP",
  "SOME",
  "START",
  "STATS",
  "STRING",
  "SUBSET",
  "SYSTEM",
  "TABLE",
  "TABLES",
  "TABLESAMPLE",
  "TEXT",
  "THEN",
  "TIES",
  "TIME",
  "TIMESTAMP",
  "TO",
  "TRAILING",
  "TRANSACTION",
  "TRUE",
  "TYPE",
  "UESCAPE",
  "UNBOUNDED",
  "UNCOMMITTED",
  "UNCONDITIONAL",
  "UNION",
  "UNIQUE",
  "UNKNOWN",
  "UNMATCHED",
  "UNNEST",
  "UPDATE",
  "USE",
  "USER",
  "USING",
  "UTF16",
  "UTF32",
  "UTF8",
  "VALIDATE",
  "VALUE",
  "VALUES",
  "VERBOSE",
  "VIEW",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITHIN",
  "WITHOUT",
  "WORK",
  "WRAPPER",
  "WRITE",
  "ZONE"
];
var dataTypes17 = [
  // https://github.com/trinodb/trino/blob/432d2897bdef99388c1a47188743a061c4ac1f34/core/trino-main/src/main/java/io/trino/metadata/TypeRegistry.java#L131-L168
  // or https://trino.io/docs/current/language/types.html
  "BIGINT",
  "INT",
  "INTEGER",
  "SMALLINT",
  "TINYINT",
  "BOOLEAN",
  "DATE",
  "DECIMAL",
  "REAL",
  "DOUBLE",
  "HYPERLOGLOG",
  "QDIGEST",
  "TDIGEST",
  "P4HYPERLOGLOG",
  "INTERVAL",
  "TIMESTAMP",
  "TIME",
  "VARBINARY",
  "VARCHAR",
  "CHAR",
  "ROW",
  "ARRAY",
  "MAP",
  "JSON",
  "JSON2016",
  "IPADDRESS",
  "GEOMETRY",
  "UUID",
  "SETDIGEST",
  "JONIREGEXP",
  "RE2JREGEXP",
  "LIKEPATTERN",
  "COLOR",
  "CODEPOINTS",
  "FUNCTION",
  "JSONPATH"
];

// node_modules/sql-formatter/dist/esm/languages/trino/trino.formatter.js
var reservedSelect17 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses17 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL | DISTINCT]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // MATCH_RECOGNIZE
  "MATCH_RECOGNIZE",
  "MEASURES",
  "ONE ROW PER MATCH",
  "ALL ROWS PER MATCH",
  "AFTER MATCH",
  "PATTERN",
  "SUBSET",
  "DEFINE"
]);
var standardOnelineClauses16 = expandPhrases(["CREATE TABLE [IF NOT EXISTS]"]);
var tabularOnelineClauses16 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [MATERIALIZED] VIEW",
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS]",
  "ADD COLUMN [IF NOT EXISTS]",
  "DROP COLUMN [IF EXISTS]",
  "RENAME COLUMN [IF EXISTS]",
  "RENAME TO",
  "SET AUTHORIZATION [USER | ROLE]",
  "SET PROPERTIES",
  "EXECUTE",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "ALTER SCHEMA",
  "ALTER MATERIALIZED VIEW",
  "ALTER VIEW",
  "CREATE SCHEMA",
  "CREATE ROLE",
  "DROP SCHEMA",
  "DROP MATERIALIZED VIEW",
  "DROP VIEW",
  "DROP ROLE",
  // Auxiliary
  "EXPLAIN",
  "ANALYZE",
  "EXPLAIN ANALYZE",
  "EXPLAIN ANALYZE VERBOSE",
  "USE",
  "DESCRIBE INPUT",
  "DESCRIBE OUTPUT",
  "REFRESH MATERIALIZED VIEW",
  "RESET SESSION",
  "SET SESSION",
  "SET PATH",
  "SET TIME ZONE",
  "SHOW GRANTS",
  "SHOW CREATE TABLE",
  "SHOW CREATE SCHEMA",
  "SHOW CREATE VIEW",
  "SHOW CREATE MATERIALIZED VIEW",
  "SHOW TABLES",
  "SHOW SCHEMAS",
  "SHOW CATALOGS",
  "SHOW COLUMNS",
  "SHOW STATS FOR",
  "SHOW ROLES",
  "SHOW CURRENT ROLES",
  "SHOW ROLE GRANTS",
  "SHOW FUNCTIONS",
  "SHOW SESSION"
]);
var reservedSetOperations17 = expandPhrases([
  "UNION [ALL | DISTINCT] [CORRESPONDING]",
  "EXCEPT [ALL | DISTINCT] [CORRESPONDING]",
  "INTERSECT [ALL | DISTINCT] [CORRESPONDING]"
]);
var reservedJoins17 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"
]);
var reservedKeywordPhrases16 = expandPhrases([
  "{ROWS | RANGE | GROUPS} BETWEEN",
  // comparison operator
  "IS [NOT] DISTINCT FROM",
  // https://trino.io/docs/current/language/types.html#timestamp-p-with-time-zone
  "[TIMESTAMP | TIME] {WITH | WITHOUT} TIME ZONE"
]);
var reservedDataTypePhrases16 = expandPhrases([]);
var trino = {
  name: "trino",
  tokenizerOptions: {
    reservedSelect: reservedSelect17,
    reservedClauses: [...reservedClauses17, ...standardOnelineClauses16, ...tabularOnelineClauses16],
    reservedSetOperations: reservedSetOperations17,
    reservedJoins: reservedJoins17,
    reservedKeywordPhrases: reservedKeywordPhrases16,
    reservedDataTypePhrases: reservedDataTypePhrases16,
    reservedKeywords: keywords17,
    reservedDataTypes: dataTypes17,
    reservedFunctionNames: functions17,
    // Trino also supports {- ... -} parenthesis.
    // The formatting of these currently works out as a result of { and -
    // not getting a space added in-between.
    // https://trino.io/docs/current/sql/match-recognize.html#row-pattern-syntax
    extraParens: ["[]", "{}"],
    // https://trino.io/docs/current/language/types.html#string
    // https://trino.io/docs/current/language/types.html#varbinary
    stringTypes: [
      { quote: "''-qq", prefixes: ["U&"] },
      { quote: "''-raw", prefixes: ["X"], requirePrefix: true }
    ],
    // https://trino.io/docs/current/language/reserved.html
    identTypes: ['""-qq'],
    paramTypes: { positional: true },
    operators: [
      "%",
      "->",
      "=>",
      ":",
      "||",
      // Row pattern syntax
      "|",
      "^",
      "$"
      // '?', conflicts with positional placeholders
    ]
  },
  formatOptions: {
    onelineClauses: [...standardOnelineClauses16, ...tabularOnelineClauses16],
    tabularOnelineClauses: tabularOnelineClauses16
  }
};

// node_modules/sql-formatter/dist/esm/languages/transactsql/transactsql.functions.js
var functions18 = [
  // https://docs.microsoft.com/en-us/sql/t-sql/functions/functions?view=sql-server-ver15
  // aggregate
  "APPROX_COUNT_DISTINCT",
  "AVG",
  "CHECKSUM_AGG",
  "COUNT",
  "COUNT_BIG",
  "GROUPING",
  "GROUPING_ID",
  "MAX",
  "MIN",
  "STDEV",
  "STDEVP",
  "SUM",
  "VAR",
  "VARP",
  // analytic
  "CUME_DIST",
  "FIRST_VALUE",
  "LAG",
  "LAST_VALUE",
  "LEAD",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PERCENT_RANK",
  "Collation - COLLATIONPROPERTY",
  "Collation - TERTIARY_WEIGHTS",
  // configuration
  "@@DBTS",
  "@@LANGID",
  "@@LANGUAGE",
  "@@LOCK_TIMEOUT",
  "@@MAX_CONNECTIONS",
  "@@MAX_PRECISION",
  "@@NESTLEVEL",
  "@@OPTIONS",
  "@@REMSERVER",
  "@@SERVERNAME",
  "@@SERVICENAME",
  "@@SPID",
  "@@TEXTSIZE",
  "@@VERSION",
  // conversion
  "CAST",
  "CONVERT",
  "PARSE",
  "TRY_CAST",
  "TRY_CONVERT",
  "TRY_PARSE",
  // cryptographic
  "ASYMKEY_ID",
  "ASYMKEYPROPERTY",
  "CERTPROPERTY",
  "CERT_ID",
  "CRYPT_GEN_RANDOM",
  "DECRYPTBYASYMKEY",
  "DECRYPTBYCERT",
  "DECRYPTBYKEY",
  "DECRYPTBYKEYAUTOASYMKEY",
  "DECRYPTBYKEYAUTOCERT",
  "DECRYPTBYPASSPHRASE",
  "ENCRYPTBYASYMKEY",
  "ENCRYPTBYCERT",
  "ENCRYPTBYKEY",
  "ENCRYPTBYPASSPHRASE",
  "HASHBYTES",
  "IS_OBJECTSIGNED",
  "KEY_GUID",
  "KEY_ID",
  "KEY_NAME",
  "SIGNBYASYMKEY",
  "SIGNBYCERT",
  "SYMKEYPROPERTY",
  "VERIFYSIGNEDBYCERT",
  "VERIFYSIGNEDBYASYMKEY",
  // cursor
  "@@CURSOR_ROWS",
  "@@FETCH_STATUS",
  "CURSOR_STATUS",
  // dataType
  "DATALENGTH",
  "IDENT_CURRENT",
  "IDENT_INCR",
  "IDENT_SEED",
  "IDENTITY",
  "SQL_VARIANT_PROPERTY",
  // datetime
  "@@DATEFIRST",
  "CURRENT_TIMESTAMP",
  "CURRENT_TIMEZONE",
  "CURRENT_TIMEZONE_ID",
  "DATEADD",
  "DATEDIFF",
  "DATEDIFF_BIG",
  "DATEFROMPARTS",
  "DATENAME",
  "DATEPART",
  "DATETIME2FROMPARTS",
  "DATETIMEFROMPARTS",
  "DATETIMEOFFSETFROMPARTS",
  "DAY",
  "EOMONTH",
  "GETDATE",
  "GETUTCDATE",
  "ISDATE",
  "MONTH",
  "SMALLDATETIMEFROMPARTS",
  "SWITCHOFFSET",
  "SYSDATETIME",
  "SYSDATETIMEOFFSET",
  "SYSUTCDATETIME",
  "TIMEFROMPARTS",
  "TODATETIMEOFFSET",
  "YEAR",
  "JSON",
  "ISJSON",
  "OPENJSON",
  "JSON_VALUE",
  "JSON_QUERY",
  "JSON_MODIFY",
  // mathematical
  "ABS",
  "ACOS",
  "ASIN",
  "ATAN",
  "ATN2",
  "CEILING",
  "COS",
  "COT",
  "DEGREES",
  "EXP",
  "FLOOR",
  "LOG",
  "LOG10",
  "PI",
  "POWER",
  "RADIANS",
  "RAND",
  "ROUND",
  "SIGN",
  "SIN",
  "SQRT",
  "SQUARE",
  "TAN",
  "CHOOSE",
  "GREATEST",
  "IIF",
  "LEAST",
  // metadata
  "@@PROCID",
  "APP_NAME",
  "APPLOCK_MODE",
  "APPLOCK_TEST",
  "ASSEMBLYPROPERTY",
  "COL_LENGTH",
  "COL_NAME",
  "COLUMNPROPERTY",
  "DATABASEPROPERTYEX",
  "DB_ID",
  "DB_NAME",
  "FILE_ID",
  "FILE_IDEX",
  "FILE_NAME",
  "FILEGROUP_ID",
  "FILEGROUP_NAME",
  "FILEGROUPPROPERTY",
  "FILEPROPERTY",
  "FILEPROPERTYEX",
  "FULLTEXTCATALOGPROPERTY",
  "FULLTEXTSERVICEPROPERTY",
  "INDEX_COL",
  "INDEXKEY_PROPERTY",
  "INDEXPROPERTY",
  "NEXT VALUE FOR",
  "OBJECT_DEFINITION",
  "OBJECT_ID",
  "OBJECT_NAME",
  "OBJECT_SCHEMA_NAME",
  "OBJECTPROPERTY",
  "OBJECTPROPERTYEX",
  "ORIGINAL_DB_NAME",
  "PARSENAME",
  "SCHEMA_ID",
  "SCHEMA_NAME",
  "SCOPE_IDENTITY",
  "SERVERPROPERTY",
  "STATS_DATE",
  "TYPE_ID",
  "TYPE_NAME",
  "TYPEPROPERTY",
  // ranking
  "DENSE_RANK",
  "NTILE",
  "RANK",
  "ROW_NUMBER",
  "PUBLISHINGSERVERNAME",
  // security
  "CERTENCODED",
  "CERTPRIVATEKEY",
  "CURRENT_USER",
  "DATABASE_PRINCIPAL_ID",
  "HAS_DBACCESS",
  "HAS_PERMS_BY_NAME",
  "IS_MEMBER",
  "IS_ROLEMEMBER",
  "IS_SRVROLEMEMBER",
  "LOGINPROPERTY",
  "ORIGINAL_LOGIN",
  "PERMISSIONS",
  "PWDENCRYPT",
  "PWDCOMPARE",
  "SESSION_USER",
  "SESSIONPROPERTY",
  "SUSER_ID",
  "SUSER_NAME",
  "SUSER_SID",
  "SUSER_SNAME",
  "SYSTEM_USER",
  "USER",
  "USER_ID",
  "USER_NAME",
  // string
  "ASCII",
  "CHARINDEX",
  "CONCAT",
  "CONCAT_WS",
  "DIFFERENCE",
  "FORMAT",
  "LEFT",
  "LEN",
  "LOWER",
  "LTRIM",
  "PATINDEX",
  "QUOTENAME",
  "REPLACE",
  "REPLICATE",
  "REVERSE",
  "RIGHT",
  "RTRIM",
  "SOUNDEX",
  "SPACE",
  "STR",
  "STRING_AGG",
  "STRING_ESCAPE",
  "STUFF",
  "SUBSTRING",
  "TRANSLATE",
  "TRIM",
  "UNICODE",
  "UPPER",
  // system
  "$PARTITION",
  "@@ERROR",
  "@@IDENTITY",
  "@@PACK_RECEIVED",
  "@@ROWCOUNT",
  "@@TRANCOUNT",
  "BINARY_CHECKSUM",
  "CHECKSUM",
  "COMPRESS",
  "CONNECTIONPROPERTY",
  "CONTEXT_INFO",
  "CURRENT_REQUEST_ID",
  "CURRENT_TRANSACTION_ID",
  "DECOMPRESS",
  "ERROR_LINE",
  "ERROR_MESSAGE",
  "ERROR_NUMBER",
  "ERROR_PROCEDURE",
  "ERROR_SEVERITY",
  "ERROR_STATE",
  "FORMATMESSAGE",
  "GET_FILESTREAM_TRANSACTION_CONTEXT",
  "GETANSINULL",
  "HOST_ID",
  "HOST_NAME",
  "ISNULL",
  "ISNUMERIC",
  "MIN_ACTIVE_ROWVERSION",
  "NEWID",
  "NEWSEQUENTIALID",
  "ROWCOUNT_BIG",
  "SESSION_CONTEXT",
  "XACT_STATE",
  // statistical
  "@@CONNECTIONS",
  "@@CPU_BUSY",
  "@@IDLE",
  "@@IO_BUSY",
  "@@PACK_SENT",
  "@@PACKET_ERRORS",
  "@@TIMETICKS",
  "@@TOTAL_ERRORS",
  "@@TOTAL_READ",
  "@@TOTAL_WRITE",
  "TEXTPTR",
  "TEXTVALID",
  // trigger
  "COLUMNS_UPDATED",
  "EVENTDATA",
  "TRIGGER_NESTLEVEL",
  "UPDATE",
  // Shorthand functions to use in place of CASE expression
  "COALESCE",
  "NULLIF"
];

// node_modules/sql-formatter/dist/esm/languages/transactsql/transactsql.keywords.js
var keywords18 = [
  // https://docs.microsoft.com/en-us/sql/t-sql/language-elements/reserved-keywords-transact-sql?view=sql-server-ver15
  // standard
  "ADD",
  "ALL",
  "ALTER",
  "AND",
  "ANY",
  "AS",
  "ASC",
  "AUTHORIZATION",
  "BACKUP",
  "BEGIN",
  "BETWEEN",
  "BREAK",
  "BROWSE",
  "BULK",
  "BY",
  "CASCADE",
  "CHECK",
  "CHECKPOINT",
  "CLOSE",
  "CLUSTERED",
  "COALESCE",
  "COLLATE",
  "COLUMN",
  "COMMIT",
  "COMPUTE",
  "CONSTRAINT",
  "CONTAINS",
  "CONTAINSTABLE",
  "CONTINUE",
  "CONVERT",
  "CREATE",
  "CROSS",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURSOR",
  "DATABASE",
  "DBCC",
  "DEALLOCATE",
  "DECLARE",
  "DEFAULT",
  "DELETE",
  "DENY",
  "DESC",
  "DISK",
  "DISTINCT",
  "DISTRIBUTED",
  "DROP",
  "DUMP",
  "ERRLVL",
  "ESCAPE",
  "EXEC",
  "EXECUTE",
  "EXISTS",
  "EXIT",
  "EXTERNAL",
  "FETCH",
  "FILE",
  "FILLFACTOR",
  "FOR",
  "FOREIGN",
  "FREETEXT",
  "FREETEXTTABLE",
  "FROM",
  "FULL",
  "FUNCTION",
  "GOTO",
  "GRANT",
  "GROUP",
  "HAVING",
  "HOLDLOCK",
  "IDENTITY",
  "IDENTITYCOL",
  "IDENTITY_INSERT",
  "IF",
  "IN",
  "INDEX",
  "INNER",
  "INSERT",
  "INTERSECT",
  "INTO",
  "IS",
  "JOIN",
  "KEY",
  "KILL",
  "LEFT",
  "LIKE",
  "LINENO",
  "LOAD",
  "MERGE",
  "NOCHECK",
  "NONCLUSTERED",
  "NOT",
  "NULL",
  "NULLIF",
  "OF",
  "OFF",
  "OFFSETS",
  "ON",
  "OPEN",
  "OPENDATASOURCE",
  "OPENQUERY",
  "OPENROWSET",
  "OPENXML",
  "OPTION",
  "OR",
  "ORDER",
  "OUTER",
  "OVER",
  "PERCENT",
  "PIVOT",
  "PLAN",
  "PRIMARY",
  "PRINT",
  "PROC",
  "PROCEDURE",
  "PUBLIC",
  "RAISERROR",
  "READ",
  "READTEXT",
  "RECONFIGURE",
  "REFERENCES",
  "REPLICATION",
  "RESTORE",
  "RESTRICT",
  "RETURN",
  "REVERT",
  "REVOKE",
  "RIGHT",
  "ROLLBACK",
  "ROWCOUNT",
  "ROWGUIDCOL",
  "RULE",
  "SAVE",
  "SCHEMA",
  "SECURITYAUDIT",
  "SELECT",
  "SEMANTICKEYPHRASETABLE",
  "SEMANTICSIMILARITYDETAILSTABLE",
  "SEMANTICSIMILARITYTABLE",
  "SESSION_USER",
  "SET",
  "SETUSER",
  "SHUTDOWN",
  "SOME",
  "STATISTICS",
  "SYSTEM_USER",
  "TABLE",
  "TABLESAMPLE",
  "TEXTSIZE",
  "THEN",
  "TO",
  "TOP",
  "TRAN",
  "TRANSACTION",
  "TRIGGER",
  "TRUNCATE",
  "TRY_CONVERT",
  "TSEQUAL",
  "UNION",
  "UNIQUE",
  "UNPIVOT",
  "UPDATE",
  "UPDATETEXT",
  "USE",
  "USER",
  "VALUES",
  "VIEW",
  "WAITFOR",
  "WHERE",
  "WHILE",
  "WITH",
  "WITHIN GROUP",
  "WRITETEXT",
  // https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver16#action
  "$ACTION"
];
var dataTypes18 = [
  // https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver15
  "BINARY",
  "BIT",
  "CHAR",
  "CHAR",
  "CHARACTER",
  "DATE",
  "DATETIME2",
  "DATETIMEOFFSET",
  "DEC",
  "DECIMAL",
  "DOUBLE",
  "FLOAT",
  "INT",
  "INTEGER",
  "NATIONAL",
  "NCHAR",
  "NUMERIC",
  "NVARCHAR",
  "PRECISION",
  "REAL",
  "SMALLINT",
  "TIME",
  "TIMESTAMP",
  "VARBINARY",
  "VARCHAR"
];

// node_modules/sql-formatter/dist/esm/languages/transactsql/transactsql.formatter.js
var reservedSelect18 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses18 = expandPhrases([
  // queries
  "WITH",
  "INTO",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  "FOR {BROWSE | XML | JSON}",
  "OPTION",
  // Data manipulation
  // - insert:
  "INSERT [INTO]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE [INTO]",
  "WHEN [NOT] MATCHED [BY TARGET | BY SOURCE] [THEN]",
  "UPDATE SET"
]);
var standardOnelineClauses17 = expandPhrases(["CREATE TABLE"]);
var tabularOnelineClauses17 = expandPhrases([
  // - create:
  "CREATE [OR ALTER] [MATERIALIZED] VIEW",
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD",
  "DROP COLUMN [IF EXISTS]",
  "ALTER COLUMN",
  // - truncate:
  "TRUNCATE TABLE",
  // indexes
  "CREATE [UNIQUE] [CLUSTERED] INDEX",
  // databases
  "CREATE DATABASE",
  "ALTER DATABASE",
  "DROP DATABASE [IF EXISTS]",
  // functions/procedures
  "CREATE [OR ALTER] [PARTITION] {FUNCTION | PROCEDURE | PROC}",
  "ALTER [PARTITION] {FUNCTION | PROCEDURE | PROC}",
  "DROP [PARTITION] {FUNCTION | PROCEDURE | PROC} [IF EXISTS]",
  // other statements
  "GO",
  "USE",
  // https://docs.microsoft.com/en-us/sql/t-sql/statements/statements?view=sql-server-ver15
  "ADD SENSITIVITY CLASSIFICATION",
  "ADD SIGNATURE",
  "AGGREGATE",
  "ANSI_DEFAULTS",
  "ANSI_NULLS",
  "ANSI_NULL_DFLT_OFF",
  "ANSI_NULL_DFLT_ON",
  "ANSI_PADDING",
  "ANSI_WARNINGS",
  "APPLICATION ROLE",
  "ARITHABORT",
  "ARITHIGNORE",
  "ASSEMBLY",
  "ASYMMETRIC KEY",
  "AUTHORIZATION",
  "AVAILABILITY GROUP",
  "BACKUP",
  "BACKUP CERTIFICATE",
  "BACKUP MASTER KEY",
  "BACKUP SERVICE MASTER KEY",
  "BEGIN CONVERSATION TIMER",
  "BEGIN DIALOG CONVERSATION",
  "BROKER PRIORITY",
  "BULK INSERT",
  "CERTIFICATE",
  "CLOSE MASTER KEY",
  "CLOSE SYMMETRIC KEY",
  "COLUMN ENCRYPTION KEY",
  "COLUMN MASTER KEY",
  "COLUMNSTORE INDEX",
  "CONCAT_NULL_YIELDS_NULL",
  "CONTEXT_INFO",
  "CONTRACT",
  "CREDENTIAL",
  "CRYPTOGRAPHIC PROVIDER",
  "CURSOR_CLOSE_ON_COMMIT",
  "DATABASE",
  "DATABASE AUDIT SPECIFICATION",
  "DATABASE ENCRYPTION KEY",
  "DATABASE HADR",
  "DATABASE SCOPED CONFIGURATION",
  "DATABASE SCOPED CREDENTIAL",
  "DATABASE SET",
  "DATEFIRST",
  "DATEFORMAT",
  "DEADLOCK_PRIORITY",
  "DENY",
  "DENY XML",
  "DISABLE TRIGGER",
  "ENABLE TRIGGER",
  "END CONVERSATION",
  "ENDPOINT",
  "EVENT NOTIFICATION",
  "EVENT SESSION",
  "EXECUTE AS",
  "EXTERNAL DATA SOURCE",
  "EXTERNAL FILE FORMAT",
  "EXTERNAL LANGUAGE",
  "EXTERNAL LIBRARY",
  "EXTERNAL RESOURCE POOL",
  "EXTERNAL TABLE",
  "FIPS_FLAGGER",
  "FMTONLY",
  "FORCEPLAN",
  "FULLTEXT CATALOG",
  "FULLTEXT INDEX",
  "FULLTEXT STOPLIST",
  "GET CONVERSATION GROUP",
  "GET_TRANSMISSION_STATUS",
  "GRANT",
  "GRANT XML",
  "IDENTITY_INSERT",
  "IMPLICIT_TRANSACTIONS",
  "INDEX",
  "LANGUAGE",
  "LOCK_TIMEOUT",
  "LOGIN",
  "MASTER KEY",
  "MESSAGE TYPE",
  "MOVE CONVERSATION",
  "NOCOUNT",
  "NOEXEC",
  "NUMERIC_ROUNDABORT",
  "OFFSETS",
  "OPEN MASTER KEY",
  "OPEN SYMMETRIC KEY",
  "PARSEONLY",
  "PARTITION SCHEME",
  "QUERY_GOVERNOR_COST_LIMIT",
  "QUEUE",
  "QUOTED_IDENTIFIER",
  "RECEIVE",
  "REMOTE SERVICE BINDING",
  "REMOTE_PROC_TRANSACTIONS",
  "RESOURCE GOVERNOR",
  "RESOURCE POOL",
  "RESTORE",
  "RESTORE FILELISTONLY",
  "RESTORE HEADERONLY",
  "RESTORE LABELONLY",
  "RESTORE MASTER KEY",
  "RESTORE REWINDONLY",
  "RESTORE SERVICE MASTER KEY",
  "RESTORE VERIFYONLY",
  "REVERT",
  "REVOKE",
  "REVOKE XML",
  "ROLE",
  "ROUTE",
  "ROWCOUNT",
  "RULE",
  "SCHEMA",
  "SEARCH PROPERTY LIST",
  "SECURITY POLICY",
  "SELECTIVE XML INDEX",
  "SEND",
  "SENSITIVITY CLASSIFICATION",
  "SEQUENCE",
  "SERVER AUDIT",
  "SERVER AUDIT SPECIFICATION",
  "SERVER CONFIGURATION",
  "SERVER ROLE",
  "SERVICE",
  "SERVICE MASTER KEY",
  "SETUSER",
  "SHOWPLAN_ALL",
  "SHOWPLAN_TEXT",
  "SHOWPLAN_XML",
  "SIGNATURE",
  "SPATIAL INDEX",
  "STATISTICS",
  "STATISTICS IO",
  "STATISTICS PROFILE",
  "STATISTICS TIME",
  "STATISTICS XML",
  "SYMMETRIC KEY",
  "SYNONYM",
  "TABLE",
  "TABLE IDENTITY",
  "TEXTSIZE",
  "TRANSACTION ISOLATION LEVEL",
  "TRIGGER",
  "TYPE",
  "UPDATE STATISTICS",
  "USER",
  "WORKLOAD GROUP",
  "XACT_ABORT",
  "XML INDEX",
  "XML SCHEMA COLLECTION"
]);
var reservedSetOperations18 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT"]);
var reservedJoins18 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  // non-standard joins
  "{CROSS | OUTER} APPLY"
]);
var reservedKeywordPhrases17 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]",
  "{ROWS | RANGE} BETWEEN"
]);
var reservedDataTypePhrases17 = expandPhrases([]);
var transactsql = {
  name: "transactsql",
  tokenizerOptions: {
    reservedSelect: reservedSelect18,
    reservedClauses: [...reservedClauses18, ...standardOnelineClauses17, ...tabularOnelineClauses17],
    reservedSetOperations: reservedSetOperations18,
    reservedJoins: reservedJoins18,
    reservedKeywordPhrases: reservedKeywordPhrases17,
    reservedDataTypePhrases: reservedDataTypePhrases17,
    reservedKeywords: keywords18,
    reservedDataTypes: dataTypes18,
    reservedFunctionNames: functions18,
    nestedBlockComments: true,
    stringTypes: [{ quote: "''-qq", prefixes: ["N"] }, "{}"],
    identTypes: [`""-qq`, "[]"],
    identChars: { first: "#@", rest: "#@$" },
    paramTypes: { named: ["@"], quoted: ["@"] },
    operators: [
      "%",
      "&",
      "|",
      "^",
      "~",
      "!<",
      "!>",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "|=",
      "&=",
      "^=",
      "::",
      ":"
    ],
    propertyAccessOperators: [".."]
    // TODO: Support for money constants
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: [...standardOnelineClauses17, ...tabularOnelineClauses17],
    tabularOnelineClauses: tabularOnelineClauses17
  }
};

// node_modules/sql-formatter/dist/esm/languages/singlestoredb/singlestoredb.keywords.js
var keywords19 = [
  // List of all keywords taken from:
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/restricted-keywords/list-of-restricted-keywords.html
  // Then filtered down to reserved keywords by running
  // > SELECT * AS <keyword>;
  // for each keyword in that list and observing which of these produce an error.
  "ADD",
  "ALL",
  "ALTER",
  "ANALYZE",
  "AND",
  "AS",
  "ASC",
  "ASENSITIVE",
  "BEFORE",
  "BETWEEN",
  "_BINARY",
  "BOTH",
  "BY",
  "CALL",
  "CASCADE",
  "CASE",
  "CHANGE",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "CONDITION",
  "CONSTRAINT",
  "CONTINUE",
  "CONVERT",
  "CREATE",
  "CROSS",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURSOR",
  "DATABASE",
  "DATABASES",
  "DAY_HOUR",
  "DAY_MICROSECOND",
  "DAY_MINUTE",
  "DAY_SECOND",
  "DECLARE",
  "DEFAULT",
  "DELAYED",
  "DELETE",
  "DESC",
  "DESCRIBE",
  "DETERMINISTIC",
  "DISTINCT",
  "DISTINCTROW",
  "DIV",
  "DROP",
  "DUAL",
  "EACH",
  "ELSE",
  "ELSEIF",
  "ENCLOSED",
  "ESCAPED",
  "EXCEPT",
  "EXISTS",
  "EXIT",
  "EXPLAIN",
  "EXTRA_JOIN",
  "FALSE",
  "FETCH",
  "FOR",
  "FORCE",
  "FORCE_COMPILED_MODE",
  "FORCE_INTERPRETER_MODE",
  "FOREIGN",
  "FROM",
  "FULL",
  "FULLTEXT",
  "GRANT",
  "GROUP",
  "HAVING",
  "HEARTBEAT_NO_LOGGING",
  "HIGH_PRIORITY",
  "HOUR_MICROSECOND",
  "HOUR_MINUTE",
  "HOUR_SECOND",
  "IF",
  "IGNORE",
  "IN",
  "INDEX",
  "INFILE",
  "INNER",
  "INOUT",
  "INSENSITIVE",
  "INSERT",
  "IN",
  "_INTERNAL_DYNAMIC_TYPECAST",
  "INTERSECT",
  "INTERVAL",
  "INTO",
  "ITERATE",
  "JOIN",
  "KEY",
  "KEYS",
  "KILL",
  "LEADING",
  "LEAVE",
  "LEFT",
  "LIKE",
  "LIMIT",
  "LINES",
  "LOAD",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCK",
  "LOOP",
  "LOW_PRIORITY",
  "MATCH",
  "MAXVALUE",
  "MINUS",
  "MINUTE_MICROSECOND",
  "MINUTE_SECOND",
  "MOD",
  "MODIFIES",
  "NATURAL",
  "NO_QUERY_REWRITE",
  "NOT",
  "NO_WRITE_TO_BINLOG",
  "NO_QUERY_REWRITE",
  "NULL",
  "ON",
  "OPTIMIZE",
  "OPTION",
  "OPTIONALLY",
  "OR",
  "ORDER",
  "OUT",
  "OUTER",
  "OUTFILE",
  "OVER",
  "PRIMARY",
  "PROCEDURE",
  "PURGE",
  "RANGE",
  "READ",
  "READS",
  "REFERENCES",
  "REGEXP",
  "RELEASE",
  "RENAME",
  "REPEAT",
  "REPLACE",
  "REQUIRE",
  "RESTRICT",
  "RETURN",
  "REVOKE",
  "RIGHT",
  "RIGHT_ANTI_JOIN",
  "RIGHT_SEMI_JOIN",
  "RIGHT_STRAIGHT_JOIN",
  "RLIKE",
  "SCHEMA",
  "SCHEMAS",
  "SECOND_MICROSECOND",
  "SELECT",
  "SEMI_JOIN",
  "SENSITIVE",
  "SEPARATOR",
  "SET",
  "SHOW",
  "SIGNAL",
  "SPATIAL",
  "SPECIFIC",
  "SQL",
  "SQL_BIG_RESULT",
  "SQL_BUFFER_RESULT",
  "SQL_CACHE",
  "SQL_CALC_FOUND_ROWS",
  "SQLEXCEPTION",
  "SQL_NO_CACHE",
  "SQL_NO_LOGGING",
  "SQL_SMALL_RESULT",
  "SQLSTATE",
  "SQLWARNING",
  "STRAIGHT_JOIN",
  "TABLE",
  "TERMINATED",
  "THEN",
  "TO",
  "TRAILING",
  "TRIGGER",
  "TRUE",
  "UNBOUNDED",
  "UNDO",
  "UNION",
  "UNIQUE",
  "UNLOCK",
  "UPDATE",
  "USAGE",
  "USE",
  "USING",
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "_UTF8",
  "VALUES",
  "WHEN",
  "WHERE",
  "WHILE",
  "WINDOW",
  "WITH",
  "WITHIN",
  "WRITE",
  "XOR",
  "YEAR_MONTH",
  "ZEROFILL"
];
var dataTypes19 = [
  // https://docs.singlestore.com/cloud/reference/sql-reference/data-types/
  "BIGINT",
  "BINARY",
  "BIT",
  "BLOB",
  "CHAR",
  "CHARACTER",
  "DATETIME",
  "DEC",
  "DECIMAL",
  "DOUBLE PRECISION",
  "DOUBLE",
  "ENUM",
  "FIXED",
  "FLOAT",
  "FLOAT4",
  "FLOAT8",
  "INT",
  "INT1",
  "INT2",
  "INT3",
  "INT4",
  "INT8",
  "INTEGER",
  "LONG",
  "LONGBLOB",
  "LONGTEXT",
  "MEDIUMBLOB",
  "MEDIUMINT",
  "MEDIUMTEXT",
  "MIDDLEINT",
  "NATIONAL CHAR",
  "NATIONAL VARCHAR",
  "NUMERIC",
  "PRECISION",
  "REAL",
  "SMALLINT",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "TINYBLOB",
  "TINYINT",
  "TINYTEXT",
  "UNSIGNED",
  "VARBINARY",
  "VARCHAR",
  "VARCHARACTER",
  "YEAR"
];

// node_modules/sql-formatter/dist/esm/languages/singlestoredb/singlestoredb.functions.js
var functions19 = [
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/vector-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/window-functions/window-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/string-functions/string-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/conditional-functions/conditional-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/numeric-functions/numeric-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/geospatial-functions/geospatial-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/json-functions/json-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/information-functions/information-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/aggregate-functions/aggregate-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/time-series-functions/time-series-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/identifier-generation-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/date-and-time-functions/date-and-time-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/distinct-count-estimation-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/full-text-search-functions/full-text-search-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/regular-expression-functions.html
  "ABS",
  "ACOS",
  "ADDDATE",
  "ADDTIME",
  "AES_DECRYPT",
  "AES_ENCRYPT",
  "ANY_VALUE",
  "APPROX_COUNT_DISTINCT",
  "APPROX_COUNT_DISTINCT_ACCUMULATE",
  "APPROX_COUNT_DISTINCT_COMBINE",
  "APPROX_COUNT_DISTINCT_ESTIMATE",
  "APPROX_GEOGRAPHY_INTERSECTS",
  "APPROX_PERCENTILE",
  "ASCII",
  "ASIN",
  "ATAN",
  "ATAN2",
  "AVG",
  "BIN",
  "BINARY",
  "BIT_AND",
  "BIT_COUNT",
  "BIT_OR",
  "BIT_XOR",
  "CAST",
  "CEIL",
  "CEILING",
  "CHAR",
  "CHARACTER_LENGTH",
  "CHAR_LENGTH",
  "CHARSET",
  "COALESCE",
  "COERCIBILITY",
  "COLLATION",
  "COLLECT",
  "CONCAT",
  "CONCAT_WS",
  "CONNECTION_ID",
  "CONV",
  "CONVERT",
  "CONVERT_TZ",
  "COS",
  "COT",
  "COUNT",
  "CUME_DIST",
  "CURDATE",
  "CURRENT_DATE",
  "CURRENT_ROLE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "CURTIME",
  "DATABASE",
  "DATE",
  "DATE_ADD",
  "DATEDIFF",
  "DATE_FORMAT",
  "DATE_SUB",
  "DATE_TRUNC",
  "DAY",
  "DAYNAME",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "DECODE",
  "DEFAULT",
  "DEGREES",
  "DENSE_RANK",
  "DIV",
  "DOT_PRODUCT",
  "ELT",
  "EUCLIDEAN_DISTANCE",
  "EXP",
  "EXTRACT",
  "FIELD",
  "FIRST",
  "FIRST_VALUE",
  "FLOOR",
  "FORMAT",
  "FOUND_ROWS",
  "FROM_BASE64",
  "FROM_DAYS",
  "FROM_UNIXTIME",
  "GEOGRAPHY_AREA",
  "GEOGRAPHY_CONTAINS",
  "GEOGRAPHY_DISTANCE",
  "GEOGRAPHY_INTERSECTS",
  "GEOGRAPHY_LATITUDE",
  "GEOGRAPHY_LENGTH",
  "GEOGRAPHY_LONGITUDE",
  "GEOGRAPHY_POINT",
  "GEOGRAPHY_WITHIN_DISTANCE",
  "GEOMETRY_AREA",
  "GEOMETRY_CONTAINS",
  "GEOMETRY_DISTANCE",
  "GEOMETRY_FILTER",
  "GEOMETRY_INTERSECTS",
  "GEOMETRY_LENGTH",
  "GEOMETRY_POINT",
  "GEOMETRY_WITHIN_DISTANCE",
  "GEOMETRY_X",
  "GEOMETRY_Y",
  "GREATEST",
  "GROUPING",
  "GROUP_CONCAT",
  "HEX",
  "HIGHLIGHT",
  "HOUR",
  "ICU_VERSION",
  "IF",
  "IFNULL",
  "INET_ATON",
  "INET_NTOA",
  "INET6_ATON",
  "INET6_NTOA",
  "INITCAP",
  "INSERT",
  "INSTR",
  "INTERVAL",
  "IS",
  "IS NULL",
  "JSON_AGG",
  "JSON_ARRAY_CONTAINS_DOUBLE",
  "JSON_ARRAY_CONTAINS_JSON",
  "JSON_ARRAY_CONTAINS_STRING",
  "JSON_ARRAY_PUSH_DOUBLE",
  "JSON_ARRAY_PUSH_JSON",
  "JSON_ARRAY_PUSH_STRING",
  "JSON_DELETE_KEY",
  "JSON_EXTRACT_DOUBLE",
  "JSON_EXTRACT_JSON",
  "JSON_EXTRACT_STRING",
  "JSON_EXTRACT_BIGINT",
  "JSON_GET_TYPE",
  "JSON_LENGTH",
  "JSON_SET_DOUBLE",
  "JSON_SET_JSON",
  "JSON_SET_STRING",
  "JSON_SPLICE_DOUBLE",
  "JSON_SPLICE_JSON",
  "JSON_SPLICE_STRING",
  "LAG",
  "LAST_DAY",
  "LAST_VALUE",
  "LCASE",
  "LEAD",
  "LEAST",
  "LEFT",
  "LENGTH",
  "LIKE",
  "LN",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOCATE",
  "LOG",
  "LOG10",
  "LOG2",
  "LPAD",
  "LTRIM",
  "MATCH",
  "MAX",
  "MD5",
  "MEDIAN",
  "MICROSECOND",
  "MIN",
  "MINUTE",
  "MOD",
  "MONTH",
  "MONTHNAME",
  "MONTHS_BETWEEN",
  "NOT",
  "NOW",
  "NTH_VALUE",
  "NTILE",
  "NULLIF",
  "OCTET_LENGTH",
  "PERCENT_RANK",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PI",
  "PIVOT",
  "POSITION",
  "POW",
  "POWER",
  "QUARTER",
  "QUOTE",
  "RADIANS",
  "RAND",
  "RANK",
  "REGEXP",
  "REPEAT",
  "REPLACE",
  "REVERSE",
  "RIGHT",
  "RLIKE",
  "ROUND",
  "ROW_COUNT",
  "ROW_NUMBER",
  "RPAD",
  "RTRIM",
  "SCALAR",
  "SCHEMA",
  "SEC_TO_TIME",
  "SHA1",
  "SHA2",
  "SIGMOID",
  "SIGN",
  "SIN",
  "SLEEP",
  "SPLIT",
  "SOUNDEX",
  "SOUNDS LIKE",
  "SOURCE_POS_WAIT",
  "SPACE",
  "SQRT",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STR_TO_DATE",
  "SUBDATE",
  "SUBSTR",
  "SUBSTRING",
  "SUBSTRING_INDEX",
  "SUM",
  "SYS_GUID",
  "TAN",
  "TIME",
  "TIMEDIFF",
  "TIME_BUCKET",
  "TIME_FORMAT",
  "TIMESTAMP",
  "TIMESTAMPADD",
  "TIMESTAMPDIFF",
  "TIME_TO_SEC",
  "TO_BASE64",
  "TO_CHAR",
  "TO_DAYS",
  "TO_JSON",
  "TO_NUMBER",
  "TO_SECONDS",
  "TO_TIMESTAMP",
  "TRIM",
  "TRUNC",
  "TRUNCATE",
  "UCASE",
  "UNHEX",
  "UNIX_TIMESTAMP",
  "UPDATEXML",
  "UPPER",
  // 'USER',
  "UTC_DATE",
  "UTC_TIME",
  "UTC_TIMESTAMP",
  "UUID",
  "VALUES",
  "VARIANCE",
  "VAR_POP",
  "VAR_SAMP",
  "VECTOR_SUB",
  "VERSION",
  "WEEK",
  "WEEKDAY",
  "WEEKOFYEAR",
  "YEAR"
];

// node_modules/sql-formatter/dist/esm/languages/singlestoredb/singlestoredb.formatter.js
var reservedSelect19 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses19 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [IGNORE] [INTO]",
  "VALUES",
  "REPLACE [INTO]",
  "ON DUPLICATE KEY UPDATE",
  // - update:
  "SET",
  // Data definition
  "CREATE [OR REPLACE] [TEMPORARY] PROCEDURE [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [EXTERNAL] FUNCTION"
]);
var standardOnelineClauses18 = expandPhrases([
  "CREATE [ROWSTORE] [REFERENCE | TEMPORARY | GLOBAL TEMPORARY] TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses18 = expandPhrases([
  // - create:
  "CREATE VIEW",
  // - update:
  "UPDATE",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER [ONLINE] TABLE",
  "ADD [COLUMN]",
  "ADD [UNIQUE] {INDEX | KEY}",
  "DROP [COLUMN]",
  "MODIFY [COLUMN]",
  "CHANGE",
  "RENAME [TO | AS]",
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference.html
  "ADD AGGREGATOR",
  "ADD LEAF",
  "AGGREGATOR SET AS MASTER",
  "ALTER DATABASE",
  "ALTER PIPELINE",
  "ALTER RESOURCE POOL",
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE TABLE",
  "ATTACH DATABASE",
  "ATTACH LEAF",
  "ATTACH LEAF ALL",
  "BACKUP DATABASE",
  "BINLOG",
  "BOOTSTRAP AGGREGATOR",
  "CACHE INDEX",
  "CALL",
  "CHANGE",
  "CHANGE MASTER TO",
  "CHANGE REPLICATION FILTER",
  "CHANGE REPLICATION SOURCE TO",
  "CHECK BLOB CHECKSUM",
  "CHECK TABLE",
  "CHECKSUM TABLE",
  "CLEAR ORPHAN DATABASES",
  "CLONE",
  "COMMIT",
  "CREATE DATABASE",
  "CREATE GROUP",
  "CREATE INDEX",
  "CREATE LINK",
  "CREATE MILESTONE",
  "CREATE PIPELINE",
  "CREATE RESOURCE POOL",
  "CREATE ROLE",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DETACH DATABASE",
  "DETACH PIPELINE",
  "DROP DATABASE",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP LINK",
  "DROP PIPELINE",
  "DROP PROCEDURE",
  "DROP RESOURCE POOL",
  "DROP ROLE",
  "DROP USER",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FLUSH",
  "FORCE",
  "GRANT",
  "HANDLER",
  "HELP",
  "KILL CONNECTION",
  "KILLALL QUERIES",
  "LOAD DATA",
  "LOAD INDEX INTO CACHE",
  "LOAD XML",
  "LOCK INSTANCE FOR BACKUP",
  "LOCK TABLES",
  "MASTER_POS_WAIT",
  "OPTIMIZE TABLE",
  "PREPARE",
  "PURGE BINARY LOGS",
  "REBALANCE PARTITIONS",
  "RELEASE SAVEPOINT",
  "REMOVE AGGREGATOR",
  "REMOVE LEAF",
  "REPAIR TABLE",
  "REPLACE",
  "REPLICATE DATABASE",
  "RESET",
  "RESET MASTER",
  "RESET PERSIST",
  "RESET REPLICA",
  "RESET SLAVE",
  "RESTART",
  "RESTORE DATABASE",
  "RESTORE REDUNDANCY",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET NAMES",
  "SET PASSWORD",
  "SET RESOURCE GROUP",
  "SET ROLE",
  "SET TRANSACTION",
  "SHOW",
  "SHOW CHARACTER SET",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE FUNCTION",
  "SHOW CREATE PIPELINE",
  "SHOW CREATE PROCEDURE",
  "SHOW CREATE TABLE",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW FUNCTION CODE",
  "SHOW FUNCTION STATUS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PLUGINS",
  "SHOW PRIVILEGES",
  "SHOW PROCEDURE CODE",
  "SHOW PROCEDURE STATUS",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW RELAYLOG EVENTS",
  "SHOW REPLICA STATUS",
  "SHOW REPLICAS",
  "SHOW SLAVE",
  "SHOW SLAVE HOSTS",
  "SHOW STATUS",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  "SHUTDOWN",
  "SNAPSHOT DATABASE",
  "SOURCE_POS_WAIT",
  "START GROUP_REPLICATION",
  "START PIPELINE",
  "START REPLICA",
  "START SLAVE",
  "START TRANSACTION",
  "STOP GROUP_REPLICATION",
  "STOP PIPELINE",
  "STOP REPLICA",
  "STOP REPLICATING",
  "STOP SLAVE",
  "TEST PIPELINE",
  "UNLOCK INSTANCE",
  "UNLOCK TABLES",
  "USE",
  "XA",
  // flow control
  "ITERATE",
  "LEAVE",
  "LOOP",
  "REPEAT",
  "RETURN",
  "WHILE"
]);
var reservedSetOperations19 = expandPhrases([
  "UNION [ALL | DISTINCT]",
  "EXCEPT",
  "INTERSECT",
  "MINUS"
]);
var reservedJoins19 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedKeywordPhrases18 = expandPhrases([
  "ON DELETE",
  "ON UPDATE",
  "CHARACTER SET",
  "{ROWS | RANGE} BETWEEN",
  "IDENTIFIED BY"
]);
var reservedDataTypePhrases18 = expandPhrases([]);
var singlestoredb = {
  name: "singlestoredb",
  tokenizerOptions: {
    reservedSelect: reservedSelect19,
    reservedClauses: [...reservedClauses19, ...standardOnelineClauses18, ...tabularOnelineClauses18],
    reservedSetOperations: reservedSetOperations19,
    reservedJoins: reservedJoins19,
    reservedKeywordPhrases: reservedKeywordPhrases18,
    reservedDataTypePhrases: reservedDataTypePhrases18,
    reservedKeywords: keywords19,
    reservedDataTypes: dataTypes19,
    reservedFunctionNames: functions19,
    // TODO: support _binary"some string" prefix
    stringTypes: [
      '""-qq-bs',
      "''-qq-bs",
      { quote: "''-raw", prefixes: ["B", "X"], requirePrefix: true }
    ],
    identTypes: ["``"],
    identChars: { first: "$", rest: "$", allowFirstCharNumber: true },
    variableTypes: [
      { regex: "@@?[A-Za-z0-9_$]+" },
      { quote: "``", prefixes: ["@"], requirePrefix: true }
    ],
    lineCommentTypes: ["--", "#"],
    operators: [
      ":=",
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      "<=>",
      "&&",
      "||",
      "::",
      "::$",
      "::%",
      ":>",
      "!:>",
      "*.*"
      // Not actually an operator
    ],
    postProcess: postProcess3
  },
  formatOptions: {
    alwaysDenseOperators: ["::", "::$", "::%"],
    onelineClauses: [...standardOnelineClauses18, ...tabularOnelineClauses18],
    tabularOnelineClauses: tabularOnelineClauses18
  }
};

// node_modules/sql-formatter/dist/esm/languages/snowflake/snowflake.functions.js
var functions20 = [
  // https://docs.snowflake.com/en/sql-reference-functions.html
  //
  // https://docs.snowflake.com/en/sql-reference/functions-all.html
  // 1. run in console on this page: $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue)
  // 2. split all lines that contain ',' or '/' into multiple lines
  // 3. remove all '— Deprecated' parts from the strings
  // 4. delete all strings that end with '<object_type>', they are already covered in the list
  // 5. remove all strings that contain '[', they are operators not functions
  // 6. fix all values that contain '*'
  // 7. delete operatos ':', '::', '||'
  //
  // Steps 1-5 can be combined by the following script in the developer console:
  // $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue) // Step 1
  //   .map(x => x.split(x.includes(',') ? ',' : '/')).flat().map(x => x.trim()) // Step 2
  //   .map(x => x.replace('— Deprecated', '')) // Step 3
  //   .filter(x => !x.endsWith('<object_type>')) // Step 4
  //   .filter(x => !x.includes('[')) // Step 5
  "ABS",
  "ACOS",
  "ACOSH",
  "ADD_MONTHS",
  "ALL_USER_NAMES",
  "ANY_VALUE",
  "APPROX_COUNT_DISTINCT",
  "APPROX_PERCENTILE",
  "APPROX_PERCENTILE_ACCUMULATE",
  "APPROX_PERCENTILE_COMBINE",
  "APPROX_PERCENTILE_ESTIMATE",
  "APPROX_TOP_K",
  "APPROX_TOP_K_ACCUMULATE",
  "APPROX_TOP_K_COMBINE",
  "APPROX_TOP_K_ESTIMATE",
  "APPROXIMATE_JACCARD_INDEX",
  "APPROXIMATE_SIMILARITY",
  "ARRAY_AGG",
  "ARRAY_APPEND",
  "ARRAY_CAT",
  "ARRAY_COMPACT",
  "ARRAY_CONSTRUCT",
  "ARRAY_CONSTRUCT_COMPACT",
  "ARRAY_CONTAINS",
  "ARRAY_INSERT",
  "ARRAY_INTERSECTION",
  "ARRAY_POSITION",
  "ARRAY_PREPEND",
  "ARRAY_SIZE",
  "ARRAY_SLICE",
  "ARRAY_TO_STRING",
  "ARRAY_UNION_AGG",
  "ARRAY_UNIQUE_AGG",
  "ARRAYS_OVERLAP",
  "AS_ARRAY",
  "AS_BINARY",
  "AS_BOOLEAN",
  "AS_CHAR",
  "AS_VARCHAR",
  "AS_DATE",
  "AS_DECIMAL",
  "AS_NUMBER",
  "AS_DOUBLE",
  "AS_REAL",
  "AS_INTEGER",
  "AS_OBJECT",
  "AS_TIME",
  "AS_TIMESTAMP_LTZ",
  "AS_TIMESTAMP_NTZ",
  "AS_TIMESTAMP_TZ",
  "ASCII",
  "ASIN",
  "ASINH",
  "ATAN",
  "ATAN2",
  "ATANH",
  "AUTO_REFRESH_REGISTRATION_HISTORY",
  "AUTOMATIC_CLUSTERING_HISTORY",
  "AVG",
  "BASE64_DECODE_BINARY",
  "BASE64_DECODE_STRING",
  "BASE64_ENCODE",
  "BIT_LENGTH",
  "BITAND",
  "BITAND_AGG",
  "BITMAP_BIT_POSITION",
  "BITMAP_BUCKET_NUMBER",
  "BITMAP_CONSTRUCT_AGG",
  "BITMAP_COUNT",
  "BITMAP_OR_AGG",
  "BITNOT",
  "BITOR",
  "BITOR_AGG",
  "BITSHIFTLEFT",
  "BITSHIFTRIGHT",
  "BITXOR",
  "BITXOR_AGG",
  "BOOLAND",
  "BOOLAND_AGG",
  "BOOLNOT",
  "BOOLOR",
  "BOOLOR_AGG",
  "BOOLXOR",
  "BOOLXOR_AGG",
  "BUILD_SCOPED_FILE_URL",
  "BUILD_STAGE_FILE_URL",
  "CASE",
  "CAST",
  "CBRT",
  "CEIL",
  "CHARINDEX",
  "CHECK_JSON",
  "CHECK_XML",
  "CHR",
  "CHAR",
  "COALESCE",
  "COLLATE",
  "COLLATION",
  "COMPLETE_TASK_GRAPHS",
  "COMPRESS",
  "CONCAT",
  "CONCAT_WS",
  "CONDITIONAL_CHANGE_EVENT",
  "CONDITIONAL_TRUE_EVENT",
  "CONTAINS",
  "CONVERT_TIMEZONE",
  "COPY_HISTORY",
  "CORR",
  "COS",
  "COSH",
  "COT",
  "COUNT",
  "COUNT_IF",
  "COVAR_POP",
  "COVAR_SAMP",
  "CUME_DIST",
  "CURRENT_ACCOUNT",
  "CURRENT_AVAILABLE_ROLES",
  "CURRENT_CLIENT",
  "CURRENT_DATABASE",
  "CURRENT_DATE",
  "CURRENT_IP_ADDRESS",
  "CURRENT_REGION",
  "CURRENT_ROLE",
  "CURRENT_SCHEMA",
  "CURRENT_SCHEMAS",
  "CURRENT_SECONDARY_ROLES",
  "CURRENT_SESSION",
  "CURRENT_STATEMENT",
  "CURRENT_TASK_GRAPHS",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_TRANSACTION",
  "CURRENT_USER",
  "CURRENT_VERSION",
  "CURRENT_WAREHOUSE",
  "DATA_TRANSFER_HISTORY",
  "DATABASE_REFRESH_HISTORY",
  "DATABASE_REFRESH_PROGRESS",
  "DATABASE_REFRESH_PROGRESS_BY_JOB",
  "DATABASE_STORAGE_USAGE_HISTORY",
  "DATE_FROM_PARTS",
  "DATE_PART",
  "DATE_TRUNC",
  "DATEADD",
  "DATEDIFF",
  "DAYNAME",
  "DECODE",
  "DECOMPRESS_BINARY",
  "DECOMPRESS_STRING",
  "DECRYPT",
  "DECRYPT_RAW",
  "DEGREES",
  "DENSE_RANK",
  "DIV0",
  "EDITDISTANCE",
  "ENCRYPT",
  "ENCRYPT_RAW",
  "ENDSWITH",
  "EQUAL_NULL",
  "EXP",
  "EXPLAIN_JSON",
  "EXTERNAL_FUNCTIONS_HISTORY",
  "EXTERNAL_TABLE_FILES",
  "EXTERNAL_TABLE_FILE_REGISTRATION_HISTORY",
  "EXTRACT",
  "EXTRACT_SEMANTIC_CATEGORIES",
  "FACTORIAL",
  "FILTER",
  "FIRST_VALUE",
  "FLATTEN",
  "FLOOR",
  "GENERATE_COLUMN_DESCRIPTION",
  "GENERATOR",
  "GET",
  "GET_ABSOLUTE_PATH",
  "GET_DDL",
  "GET_IGNORE_CASE",
  "GET_OBJECT_REFERENCES",
  "GET_PATH",
  "GET_PRESIGNED_URL",
  "GET_RELATIVE_PATH",
  "GET_STAGE_LOCATION",
  "GETBIT",
  "GREATEST",
  "GREATEST_IGNORE_NULLS",
  "GROUPING",
  "GROUPING_ID",
  "HASH",
  "HASH_AGG",
  "HAVERSINE",
  "HEX_DECODE_BINARY",
  "HEX_DECODE_STRING",
  "HEX_ENCODE",
  "HLL",
  "HLL_ACCUMULATE",
  "HLL_COMBINE",
  "HLL_ESTIMATE",
  "HLL_EXPORT",
  "HLL_IMPORT",
  "HOUR",
  "MINUTE",
  "SECOND",
  "IDENTIFIER",
  "IFF",
  "IFNULL",
  "ILIKE",
  "ILIKE ANY",
  "INFER_SCHEMA",
  "INITCAP",
  "INSERT",
  "INVOKER_ROLE",
  "INVOKER_SHARE",
  "IS_ARRAY",
  "IS_BINARY",
  "IS_BOOLEAN",
  "IS_CHAR",
  "IS_VARCHAR",
  "IS_DATE",
  "IS_DATE_VALUE",
  "IS_DECIMAL",
  "IS_DOUBLE",
  "IS_REAL",
  "IS_GRANTED_TO_INVOKER_ROLE",
  "IS_INTEGER",
  "IS_NULL_VALUE",
  "IS_OBJECT",
  "IS_ROLE_IN_SESSION",
  "IS_TIME",
  "IS_TIMESTAMP_LTZ",
  "IS_TIMESTAMP_NTZ",
  "IS_TIMESTAMP_TZ",
  "JAROWINKLER_SIMILARITY",
  "JSON_EXTRACT_PATH_TEXT",
  "KURTOSIS",
  "LAG",
  "LAST_DAY",
  "LAST_QUERY_ID",
  "LAST_TRANSACTION",
  "LAST_VALUE",
  "LEAD",
  "LEAST",
  "LEFT",
  "LENGTH",
  "LEN",
  "LIKE",
  "LIKE ALL",
  "LIKE ANY",
  "LISTAGG",
  "LN",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "LOG",
  "LOGIN_HISTORY",
  "LOGIN_HISTORY_BY_USER",
  "LOWER",
  "LPAD",
  "LTRIM",
  "MATERIALIZED_VIEW_REFRESH_HISTORY",
  "MD5",
  "MD5_HEX",
  "MD5_BINARY",
  "MD5_NUMBER \u2014 Obsoleted",
  "MD5_NUMBER_LOWER64",
  "MD5_NUMBER_UPPER64",
  "MEDIAN",
  "MIN",
  "MAX",
  "MINHASH",
  "MINHASH_COMBINE",
  "MOD",
  "MODE",
  "MONTHNAME",
  "MONTHS_BETWEEN",
  "NEXT_DAY",
  "NORMAL",
  "NTH_VALUE",
  "NTILE",
  "NULLIF",
  "NULLIFZERO",
  "NVL",
  "NVL2",
  "OBJECT_AGG",
  "OBJECT_CONSTRUCT",
  "OBJECT_CONSTRUCT_KEEP_NULL",
  "OBJECT_DELETE",
  "OBJECT_INSERT",
  "OBJECT_KEYS",
  "OBJECT_PICK",
  "OCTET_LENGTH",
  "PARSE_IP",
  "PARSE_JSON",
  "PARSE_URL",
  "PARSE_XML",
  "PERCENT_RANK",
  "PERCENTILE_CONT",
  "PERCENTILE_DISC",
  "PI",
  "PIPE_USAGE_HISTORY",
  "POLICY_CONTEXT",
  "POLICY_REFERENCES",
  "POSITION",
  "POW",
  "POWER",
  "PREVIOUS_DAY",
  "QUERY_ACCELERATION_HISTORY",
  "QUERY_HISTORY",
  "QUERY_HISTORY_BY_SESSION",
  "QUERY_HISTORY_BY_USER",
  "QUERY_HISTORY_BY_WAREHOUSE",
  "RADIANS",
  "RANDOM",
  "RANDSTR",
  "RANK",
  "RATIO_TO_REPORT",
  "REGEXP",
  "REGEXP_COUNT",
  "REGEXP_INSTR",
  "REGEXP_LIKE",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "REGEXP_SUBSTR_ALL",
  "REGR_AVGX",
  "REGR_AVGY",
  "REGR_COUNT",
  "REGR_INTERCEPT",
  "REGR_R2",
  "REGR_SLOPE",
  "REGR_SXX",
  "REGR_SXY",
  "REGR_SYY",
  "REGR_VALX",
  "REGR_VALY",
  "REPEAT",
  "REPLACE",
  "REPLICATION_GROUP_REFRESH_HISTORY",
  "REPLICATION_GROUP_REFRESH_PROGRESS",
  "REPLICATION_GROUP_REFRESH_PROGRESS_BY_JOB",
  "REPLICATION_GROUP_USAGE_HISTORY",
  "REPLICATION_USAGE_HISTORY",
  "REST_EVENT_HISTORY",
  "RESULT_SCAN",
  "REVERSE",
  "RIGHT",
  "RLIKE",
  "ROUND",
  "ROW_NUMBER",
  "RPAD",
  "RTRIM",
  "RTRIMMED_LENGTH",
  "SEARCH_OPTIMIZATION_HISTORY",
  "SEQ1",
  "SEQ2",
  "SEQ4",
  "SEQ8",
  "SERVERLESS_TASK_HISTORY",
  "SHA1",
  "SHA1_HEX",
  "SHA1_BINARY",
  "SHA2",
  "SHA2_HEX",
  "SHA2_BINARY",
  "SIGN",
  "SIN",
  "SINH",
  "SKEW",
  "SOUNDEX",
  "SPACE",
  "SPLIT",
  "SPLIT_PART",
  "SPLIT_TO_TABLE",
  "SQRT",
  "SQUARE",
  "ST_AREA",
  "ST_ASEWKB",
  "ST_ASEWKT",
  "ST_ASGEOJSON",
  "ST_ASWKB",
  "ST_ASBINARY",
  "ST_ASWKT",
  "ST_ASTEXT",
  "ST_AZIMUTH",
  "ST_CENTROID",
  "ST_COLLECT",
  "ST_CONTAINS",
  "ST_COVEREDBY",
  "ST_COVERS",
  "ST_DIFFERENCE",
  "ST_DIMENSION",
  "ST_DISJOINT",
  "ST_DISTANCE",
  "ST_DWITHIN",
  "ST_ENDPOINT",
  "ST_ENVELOPE",
  "ST_GEOGFROMGEOHASH",
  "ST_GEOGPOINTFROMGEOHASH",
  "ST_GEOGRAPHYFROMWKB",
  "ST_GEOGRAPHYFROMWKT",
  "ST_GEOHASH",
  "ST_GEOMETRYFROMWKB",
  "ST_GEOMETRYFROMWKT",
  "ST_HAUSDORFFDISTANCE",
  "ST_INTERSECTION",
  "ST_INTERSECTS",
  "ST_LENGTH",
  "ST_MAKEGEOMPOINT",
  "ST_GEOM_POINT",
  "ST_MAKELINE",
  "ST_MAKEPOINT",
  "ST_POINT",
  "ST_MAKEPOLYGON",
  "ST_POLYGON",
  "ST_NPOINTS",
  "ST_NUMPOINTS",
  "ST_PERIMETER",
  "ST_POINTN",
  "ST_SETSRID",
  "ST_SIMPLIFY",
  "ST_SRID",
  "ST_STARTPOINT",
  "ST_SYMDIFFERENCE",
  "ST_UNION",
  "ST_WITHIN",
  "ST_X",
  "ST_XMAX",
  "ST_XMIN",
  "ST_Y",
  "ST_YMAX",
  "ST_YMIN",
  "STAGE_DIRECTORY_FILE_REGISTRATION_HISTORY",
  "STAGE_STORAGE_USAGE_HISTORY",
  "STARTSWITH",
  "STDDEV",
  "STDDEV_POP",
  "STDDEV_SAMP",
  "STRIP_NULL_VALUE",
  "STRTOK",
  "STRTOK_SPLIT_TO_TABLE",
  "STRTOK_TO_ARRAY",
  "SUBSTR",
  "SUBSTRING",
  "SUM",
  "SYSDATE",
  "SYSTEM$ABORT_SESSION",
  "SYSTEM$ABORT_TRANSACTION",
  "SYSTEM$AUTHORIZE_PRIVATELINK",
  "SYSTEM$AUTHORIZE_STAGE_PRIVATELINK_ACCESS",
  "SYSTEM$BEHAVIOR_CHANGE_BUNDLE_STATUS",
  "SYSTEM$CANCEL_ALL_QUERIES",
  "SYSTEM$CANCEL_QUERY",
  "SYSTEM$CLUSTERING_DEPTH",
  "SYSTEM$CLUSTERING_INFORMATION",
  "SYSTEM$CLUSTERING_RATIO ",
  "SYSTEM$CURRENT_USER_TASK_NAME",
  "SYSTEM$DATABASE_REFRESH_HISTORY ",
  "SYSTEM$DATABASE_REFRESH_PROGRESS",
  "SYSTEM$DATABASE_REFRESH_PROGRESS_BY_JOB ",
  "SYSTEM$DISABLE_BEHAVIOR_CHANGE_BUNDLE",
  "SYSTEM$DISABLE_DATABASE_REPLICATION",
  "SYSTEM$ENABLE_BEHAVIOR_CHANGE_BUNDLE",
  "SYSTEM$ESTIMATE_QUERY_ACCELERATION",
  "SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS",
  "SYSTEM$EXPLAIN_JSON_TO_TEXT",
  "SYSTEM$EXPLAIN_PLAN_JSON",
  "SYSTEM$EXTERNAL_TABLE_PIPE_STATUS",
  "SYSTEM$GENERATE_SAML_CSR",
  "SYSTEM$GENERATE_SCIM_ACCESS_TOKEN",
  "SYSTEM$GET_AWS_SNS_IAM_POLICY",
  "SYSTEM$GET_PREDECESSOR_RETURN_VALUE",
  "SYSTEM$GET_PRIVATELINK",
  "SYSTEM$GET_PRIVATELINK_AUTHORIZED_ENDPOINTS",
  "SYSTEM$GET_PRIVATELINK_CONFIG",
  "SYSTEM$GET_SNOWFLAKE_PLATFORM_INFO",
  "SYSTEM$GET_TAG",
  "SYSTEM$GET_TAG_ALLOWED_VALUES",
  "SYSTEM$GET_TAG_ON_CURRENT_COLUMN",
  "SYSTEM$GET_TAG_ON_CURRENT_TABLE",
  "SYSTEM$GLOBAL_ACCOUNT_SET_PARAMETER",
  "SYSTEM$LAST_CHANGE_COMMIT_TIME",
  "SYSTEM$LINK_ACCOUNT_OBJECTS_BY_NAME",
  "SYSTEM$MIGRATE_SAML_IDP_REGISTRATION",
  "SYSTEM$PIPE_FORCE_RESUME",
  "SYSTEM$PIPE_STATUS",
  "SYSTEM$REVOKE_PRIVATELINK",
  "SYSTEM$REVOKE_STAGE_PRIVATELINK_ACCESS",
  "SYSTEM$SET_RETURN_VALUE",
  "SYSTEM$SHOW_OAUTH_CLIENT_SECRETS",
  "SYSTEM$STREAM_GET_TABLE_TIMESTAMP",
  "SYSTEM$STREAM_HAS_DATA",
  "SYSTEM$TASK_DEPENDENTS_ENABLE",
  "SYSTEM$TYPEOF",
  "SYSTEM$USER_TASK_CANCEL_ONGOING_EXECUTIONS",
  "SYSTEM$VERIFY_EXTERNAL_OAUTH_TOKEN",
  "SYSTEM$WAIT",
  "SYSTEM$WHITELIST",
  "SYSTEM$WHITELIST_PRIVATELINK",
  "TAG_REFERENCES",
  "TAG_REFERENCES_ALL_COLUMNS",
  "TAG_REFERENCES_WITH_LINEAGE",
  "TAN",
  "TANH",
  "TASK_DEPENDENTS",
  "TASK_HISTORY",
  "TIME_FROM_PARTS",
  "TIME_SLICE",
  "TIMEADD",
  "TIMEDIFF",
  "TIMESTAMP_FROM_PARTS",
  "TIMESTAMPADD",
  "TIMESTAMPDIFF",
  "TO_ARRAY",
  "TO_BINARY",
  "TO_BOOLEAN",
  "TO_CHAR",
  "TO_VARCHAR",
  "TO_DATE",
  "DATE",
  "TO_DECIMAL",
  "TO_NUMBER",
  "TO_NUMERIC",
  "TO_DOUBLE",
  "TO_GEOGRAPHY",
  "TO_GEOMETRY",
  "TO_JSON",
  "TO_OBJECT",
  "TO_TIME",
  "TIME",
  "TO_TIMESTAMP",
  "TO_TIMESTAMP_LTZ",
  "TO_TIMESTAMP_NTZ",
  "TO_TIMESTAMP_TZ",
  "TO_VARIANT",
  "TO_XML",
  "TRANSLATE",
  "TRIM",
  "TRUNCATE",
  "TRUNC",
  "TRUNC",
  "TRY_BASE64_DECODE_BINARY",
  "TRY_BASE64_DECODE_STRING",
  "TRY_CAST",
  "TRY_HEX_DECODE_BINARY",
  "TRY_HEX_DECODE_STRING",
  "TRY_PARSE_JSON",
  "TRY_TO_BINARY",
  "TRY_TO_BOOLEAN",
  "TRY_TO_DATE",
  "TRY_TO_DECIMAL",
  "TRY_TO_NUMBER",
  "TRY_TO_NUMERIC",
  "TRY_TO_DOUBLE",
  "TRY_TO_GEOGRAPHY",
  "TRY_TO_GEOMETRY",
  "TRY_TO_TIME",
  "TRY_TO_TIMESTAMP",
  "TRY_TO_TIMESTAMP_LTZ",
  "TRY_TO_TIMESTAMP_NTZ",
  "TRY_TO_TIMESTAMP_TZ",
  "TYPEOF",
  "UNICODE",
  "UNIFORM",
  "UPPER",
  "UUID_STRING",
  "VALIDATE",
  "VALIDATE_PIPE_LOAD",
  "VAR_POP",
  "VAR_SAMP",
  "VARIANCE",
  "VARIANCE_SAMP",
  "VARIANCE_POP",
  "WAREHOUSE_LOAD_HISTORY",
  "WAREHOUSE_METERING_HISTORY",
  "WIDTH_BUCKET",
  "XMLGET",
  "YEAR",
  "YEAROFWEEK",
  "YEAROFWEEKISO",
  "DAY",
  "DAYOFMONTH",
  "DAYOFWEEK",
  "DAYOFWEEKISO",
  "DAYOFYEAR",
  "WEEK",
  "WEEK",
  "WEEKOFYEAR",
  "WEEKISO",
  "MONTH",
  "QUARTER",
  "ZEROIFNULL",
  "ZIPF"
];

// node_modules/sql-formatter/dist/esm/languages/snowflake/snowflake.keywords.js
var keywords20 = [
  // https://docs.snowflake.com/en/sql-reference/reserved-keywords.html
  //
  // run in console on this page: $x('//tbody/tr/*[1]/p/text()').map(x => x.nodeValue)
  "ACCOUNT",
  "ALL",
  "ALTER",
  "AND",
  "ANY",
  "AS",
  "BETWEEN",
  "BY",
  "CASE",
  "CAST",
  "CHECK",
  "COLUMN",
  "CONNECT",
  "CONNECTION",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "CURRENT_USER",
  "DATABASE",
  "DELETE",
  "DISTINCT",
  "DROP",
  "ELSE",
  "EXISTS",
  "FALSE",
  "FOLLOWING",
  "FOR",
  "FROM",
  "FULL",
  "GRANT",
  "GROUP",
  "GSCLUSTER",
  "HAVING",
  "ILIKE",
  "IN",
  "INCREMENT",
  "INNER",
  "INSERT",
  "INTERSECT",
  "INTO",
  "IS",
  "ISSUE",
  "JOIN",
  "LATERAL",
  "LEFT",
  "LIKE",
  "LOCALTIME",
  "LOCALTIMESTAMP",
  "MINUS",
  "NATURAL",
  "NOT",
  "NULL",
  "OF",
  "ON",
  "OR",
  "ORDER",
  "ORGANIZATION",
  "QUALIFY",
  "REGEXP",
  "REVOKE",
  "RIGHT",
  "RLIKE",
  "ROW",
  "ROWS",
  "SAMPLE",
  "SCHEMA",
  "SELECT",
  "SET",
  "SOME",
  "START",
  "TABLE",
  "TABLESAMPLE",
  "THEN",
  "TO",
  "TRIGGER",
  "TRUE",
  "TRY_CAST",
  "UNION",
  "UNIQUE",
  "UPDATE",
  "USING",
  "VALUES",
  "VIEW",
  "WHEN",
  "WHENEVER",
  "WHERE",
  "WITH",
  // These are definitely keywords, but haven't found a definite list in the docs
  "COMMENT"
];
var dataTypes20 = [
  "NUMBER",
  "DECIMAL",
  "NUMERIC",
  "INT",
  "INTEGER",
  "BIGINT",
  "SMALLINT",
  "TINYINT",
  "BYTEINT",
  "FLOAT",
  "FLOAT4",
  "FLOAT8",
  "DOUBLE",
  "DOUBLE PRECISION",
  "REAL",
  "VARCHAR",
  "CHAR",
  "CHARACTER",
  "STRING",
  "TEXT",
  "BINARY",
  "VARBINARY",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "TIME",
  "TIMESTAMP",
  "TIMESTAMP_LTZ",
  "TIMESTAMP_NTZ",
  "TIMESTAMP",
  "TIMESTAMP_TZ",
  "VARIANT",
  "OBJECT",
  "ARRAY",
  "GEOGRAPHY",
  "GEOMETRY"
];

// node_modules/sql-formatter/dist/esm/languages/snowflake/snowflake.formatter.js
var reservedSelect20 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses20 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "QUALIFY",
  "LIMIT",
  "OFFSET",
  "FETCH [FIRST | NEXT]",
  // Data manipulation
  // - insert:
  "INSERT [OVERWRITE] [ALL INTO | INTO | ALL | FIRST]",
  "{THEN | ELSE} INTO",
  "VALUES",
  // - update:
  "SET",
  "CLUSTER BY",
  "[WITH] {MASKING POLICY | TAG | ROW ACCESS POLICY}",
  "COPY GRANTS",
  "USING TEMPLATE",
  "MERGE INTO",
  "WHEN MATCHED [AND]",
  "THEN {UPDATE SET | DELETE}",
  "WHEN NOT MATCHED THEN INSERT"
]);
var standardOnelineClauses19 = expandPhrases([
  "CREATE [OR REPLACE] [VOLATILE] TABLE [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [LOCAL | GLOBAL] {TEMP|TEMPORARY} TABLE [IF NOT EXISTS]"
]);
var tabularOnelineClauses19 = expandPhrases([
  // - create:
  "CREATE [OR REPLACE] [SECURE] [RECURSIVE] VIEW [IF NOT EXISTS]",
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS]",
  "RENAME TO",
  "SWAP WITH",
  "[SUSPEND | RESUME] RECLUSTER",
  "DROP CLUSTERING KEY",
  "ADD [COLUMN]",
  "RENAME COLUMN",
  "{ALTER | MODIFY} [COLUMN]",
  "DROP [COLUMN]",
  "{ADD | ALTER | MODIFY | DROP} [CONSTRAINT]",
  "RENAME CONSTRAINT",
  "{ADD | DROP} SEARCH OPTIMIZATION",
  "{SET | UNSET} TAG",
  "{ADD | DROP} ROW ACCESS POLICY",
  "DROP ALL ROW ACCESS POLICIES",
  "{SET | DROP} DEFAULT",
  "{SET | DROP} NOT NULL",
  "SET DATA TYPE",
  "UNSET COMMENT",
  "{SET | UNSET} MASKING POLICY",
  // - truncate:
  "TRUNCATE [TABLE] [IF EXISTS]",
  // other
  // https://docs.snowflake.com/en/sql-reference/sql-all.html
  //
  // 1. run in console on this page: $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue)
  // 2. delete all lines that contain a sting like '(.*)', they are already covered in the list
  // 3. delete all lines that contain a sting like '<.*>', they are already covered in the list
  // 4. delete all lines that contain '…', they are part of a regex statement that can't be covered here
  // 5. Manually add 'COPY INTO'
  // 6. Remove all lines that are already in `reservedClauses`
  //
  // Steps 1-4 can be combined by the following script in the developer console:
  // $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue) // Step 1
  //   filter(x => !x.match(/\(.*\)/) && !x.match(/…/) && !x.match(/<.*>/)) // Step 2-4
  "ALTER ACCOUNT",
  "ALTER API INTEGRATION",
  "ALTER CONNECTION",
  "ALTER DATABASE",
  "ALTER EXTERNAL TABLE",
  "ALTER FAILOVER GROUP",
  "ALTER FILE FORMAT",
  "ALTER FUNCTION",
  "ALTER INTEGRATION",
  "ALTER MASKING POLICY",
  "ALTER MATERIALIZED VIEW",
  "ALTER NETWORK POLICY",
  "ALTER NOTIFICATION INTEGRATION",
  "ALTER PIPE",
  "ALTER PROCEDURE",
  "ALTER REPLICATION GROUP",
  "ALTER RESOURCE MONITOR",
  "ALTER ROLE",
  "ALTER ROW ACCESS POLICY",
  "ALTER SCHEMA",
  "ALTER SECURITY INTEGRATION",
  "ALTER SEQUENCE",
  "ALTER SESSION",
  "ALTER SESSION POLICY",
  "ALTER SHARE",
  "ALTER STAGE",
  "ALTER STORAGE INTEGRATION",
  "ALTER STREAM",
  "ALTER TAG",
  "ALTER TASK",
  "ALTER USER",
  "ALTER VIEW",
  "ALTER WAREHOUSE",
  "BEGIN",
  "CALL",
  "COMMIT",
  "COPY INTO",
  "CREATE ACCOUNT",
  "CREATE API INTEGRATION",
  "CREATE CONNECTION",
  "CREATE DATABASE",
  "CREATE EXTERNAL FUNCTION",
  "CREATE EXTERNAL TABLE",
  "CREATE FAILOVER GROUP",
  "CREATE FILE FORMAT",
  "CREATE FUNCTION",
  "CREATE INTEGRATION",
  "CREATE MANAGED ACCOUNT",
  "CREATE MASKING POLICY",
  "CREATE MATERIALIZED VIEW",
  "CREATE NETWORK POLICY",
  "CREATE NOTIFICATION INTEGRATION",
  "CREATE PIPE",
  "CREATE PROCEDURE",
  "CREATE REPLICATION GROUP",
  "CREATE RESOURCE MONITOR",
  "CREATE ROLE",
  "CREATE ROW ACCESS POLICY",
  "CREATE SCHEMA",
  "CREATE SECURITY INTEGRATION",
  "CREATE SEQUENCE",
  "CREATE SESSION POLICY",
  "CREATE SHARE",
  "CREATE STAGE",
  "CREATE STORAGE INTEGRATION",
  "CREATE STREAM",
  "CREATE TAG",
  "CREATE TASK",
  "CREATE USER",
  "CREATE WAREHOUSE",
  "DELETE",
  "DESCRIBE DATABASE",
  "DESCRIBE EXTERNAL TABLE",
  "DESCRIBE FILE FORMAT",
  "DESCRIBE FUNCTION",
  "DESCRIBE INTEGRATION",
  "DESCRIBE MASKING POLICY",
  "DESCRIBE MATERIALIZED VIEW",
  "DESCRIBE NETWORK POLICY",
  "DESCRIBE PIPE",
  "DESCRIBE PROCEDURE",
  "DESCRIBE RESULT",
  "DESCRIBE ROW ACCESS POLICY",
  "DESCRIBE SCHEMA",
  "DESCRIBE SEQUENCE",
  "DESCRIBE SESSION POLICY",
  "DESCRIBE SHARE",
  "DESCRIBE STAGE",
  "DESCRIBE STREAM",
  "DESCRIBE TABLE",
  "DESCRIBE TASK",
  "DESCRIBE TRANSACTION",
  "DESCRIBE USER",
  "DESCRIBE VIEW",
  "DESCRIBE WAREHOUSE",
  "DROP CONNECTION",
  "DROP DATABASE",
  "DROP EXTERNAL TABLE",
  "DROP FAILOVER GROUP",
  "DROP FILE FORMAT",
  "DROP FUNCTION",
  "DROP INTEGRATION",
  "DROP MANAGED ACCOUNT",
  "DROP MASKING POLICY",
  "DROP MATERIALIZED VIEW",
  "DROP NETWORK POLICY",
  "DROP PIPE",
  "DROP PROCEDURE",
  "DROP REPLICATION GROUP",
  "DROP RESOURCE MONITOR",
  "DROP ROLE",
  "DROP ROW ACCESS POLICY",
  "DROP SCHEMA",
  "DROP SEQUENCE",
  "DROP SESSION POLICY",
  "DROP SHARE",
  "DROP STAGE",
  "DROP STREAM",
  "DROP TAG",
  "DROP TASK",
  "DROP USER",
  "DROP VIEW",
  "DROP WAREHOUSE",
  "EXECUTE IMMEDIATE",
  "EXECUTE TASK",
  "EXPLAIN",
  "GET",
  "GRANT OWNERSHIP",
  "GRANT ROLE",
  "INSERT",
  "LIST",
  "MERGE",
  "PUT",
  "REMOVE",
  "REVOKE ROLE",
  "ROLLBACK",
  "SHOW COLUMNS",
  "SHOW CONNECTIONS",
  "SHOW DATABASES",
  "SHOW DATABASES IN FAILOVER GROUP",
  "SHOW DATABASES IN REPLICATION GROUP",
  "SHOW DELEGATED AUTHORIZATIONS",
  "SHOW EXTERNAL FUNCTIONS",
  "SHOW EXTERNAL TABLES",
  "SHOW FAILOVER GROUPS",
  "SHOW FILE FORMATS",
  "SHOW FUNCTIONS",
  "SHOW GLOBAL ACCOUNTS",
  "SHOW GRANTS",
  "SHOW INTEGRATIONS",
  "SHOW LOCKS",
  "SHOW MANAGED ACCOUNTS",
  "SHOW MASKING POLICIES",
  "SHOW MATERIALIZED VIEWS",
  "SHOW NETWORK POLICIES",
  "SHOW OBJECTS",
  "SHOW ORGANIZATION ACCOUNTS",
  "SHOW PARAMETERS",
  "SHOW PIPES",
  "SHOW PRIMARY KEYS",
  "SHOW PROCEDURES",
  "SHOW REGIONS",
  "SHOW REPLICATION ACCOUNTS",
  "SHOW REPLICATION DATABASES",
  "SHOW REPLICATION GROUPS",
  "SHOW RESOURCE MONITORS",
  "SHOW ROLES",
  "SHOW ROW ACCESS POLICIES",
  "SHOW SCHEMAS",
  "SHOW SEQUENCES",
  "SHOW SESSION POLICIES",
  "SHOW SHARES",
  "SHOW SHARES IN FAILOVER GROUP",
  "SHOW SHARES IN REPLICATION GROUP",
  "SHOW STAGES",
  "SHOW STREAMS",
  "SHOW TABLES",
  "SHOW TAGS",
  "SHOW TASKS",
  "SHOW TRANSACTIONS",
  "SHOW USER FUNCTIONS",
  "SHOW USERS",
  "SHOW VARIABLES",
  "SHOW VIEWS",
  "SHOW WAREHOUSES",
  "TRUNCATE MATERIALIZED VIEW",
  "UNDROP DATABASE",
  "UNDROP SCHEMA",
  "UNDROP TABLE",
  "UNDROP TAG",
  "UNSET",
  "USE DATABASE",
  "USE ROLE",
  "USE SCHEMA",
  "USE SECONDARY ROLES",
  "USE WAREHOUSE"
]);
var reservedSetOperations20 = expandPhrases(["UNION [ALL]", "MINUS", "EXCEPT", "INTERSECT"]);
var reservedJoins20 = expandPhrases([
  "[INNER] JOIN",
  "[NATURAL] {LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{CROSS | NATURAL} JOIN"
]);
var reservedKeywordPhrases19 = expandPhrases([
  "{ROWS | RANGE} BETWEEN",
  "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]"
]);
var reservedDataTypePhrases19 = expandPhrases([]);
var snowflake = {
  name: "snowflake",
  tokenizerOptions: {
    reservedSelect: reservedSelect20,
    reservedClauses: [...reservedClauses20, ...standardOnelineClauses19, ...tabularOnelineClauses19],
    reservedSetOperations: reservedSetOperations20,
    reservedJoins: reservedJoins20,
    reservedKeywordPhrases: reservedKeywordPhrases19,
    reservedDataTypePhrases: reservedDataTypePhrases19,
    reservedKeywords: keywords20,
    reservedDataTypes: dataTypes20,
    reservedFunctionNames: functions20,
    stringTypes: ["$$", `''-qq-bs`],
    identTypes: ['""-qq'],
    variableTypes: [
      // for accessing columns at certain positons in the table
      { regex: "[$][1-9]\\d*" },
      // identifier style syntax
      { regex: "[$][_a-zA-Z][_a-zA-Z0-9$]*" }
    ],
    extraParens: ["[]"],
    identChars: { rest: "$" },
    lineCommentTypes: ["--", "//"],
    operators: [
      // Modulo
      "%",
      // Type cast
      "::",
      // String concat
      "||",
      // Generators: https://docs.snowflake.com/en/sql-reference/functions/generator.html#generator
      "=>",
      // Assignment https://docs.snowflake.com/en/sql-reference/snowflake-scripting/let
      ":=",
      // Lambda: https://docs.snowflake.com/en/user-guide/querying-semistructured#lambda-expressions
      "->"
    ],
    propertyAccessOperators: [":"]
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: [...standardOnelineClauses19, ...tabularOnelineClauses19],
    tabularOnelineClauses: tabularOnelineClauses19
  }
};

// node_modules/sql-formatter/dist/esm/utils.js
var last = (arr) => arr[arr.length - 1];
var sortByLengthDesc = (strings) => strings.sort((a, b) => b.length - a.length || a.localeCompare(b));
var equalizeWhitespace = (s) => s.replace(/\s+/gu, " ");
var isMultiline = (text) => /\n/.test(text);

// node_modules/sql-formatter/dist/esm/lexer/regexUtil.js
var escapeRegExp = (string2) => string2.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
var WHITESPACE_REGEX = /\s+/uy;
var patternToRegex = (pattern) => new RegExp(`(?:${pattern})`, "uy");
var toCaseInsensitivePattern = (prefix) => prefix.split("").map((char) => / /gu.test(char) ? "\\s+" : `[${char.toUpperCase()}${char.toLowerCase()}]`).join("");
var withDashes = (pattern) => pattern + "(?:-" + pattern + ")*";
var prefixesPattern = ({ prefixes, requirePrefix }) => `(?:${prefixes.map(toCaseInsensitivePattern).join("|")}${requirePrefix ? "" : "|"})`;

// node_modules/sql-formatter/dist/esm/lexer/regexFactory.js
var lineComment = (lineCommentTypes) => new RegExp(`(?:${lineCommentTypes.map(escapeRegExp).join("|")}).*?(?=\r
|\r|
|$)`, "uy");
var parenthesis = (kind, extraParens = []) => {
  const index = kind === "open" ? 0 : 1;
  const parens = ["()", ...extraParens].map((pair) => pair[index]);
  return patternToRegex(parens.map(escapeRegExp).join("|"));
};
var operator = (operators) => patternToRegex(`${sortByLengthDesc(operators).map(escapeRegExp).join("|")}`);
var rejectIdentCharsPattern = ({ rest, dashes }) => rest || dashes ? `(?![${rest || ""}${dashes ? "-" : ""}])` : "";
var reservedWord = (reservedKeywords, identChars = {}) => {
  if (reservedKeywords.length === 0) {
    return /^\b$/u;
  }
  const avoidIdentChars = rejectIdentCharsPattern(identChars);
  const reservedKeywordsPattern = sortByLengthDesc(reservedKeywords).map(escapeRegExp).join("|").replace(/ /gu, "\\s+");
  return new RegExp(`(?:${reservedKeywordsPattern})${avoidIdentChars}\\b`, "iuy");
};
var parameter = (paramTypes, pattern) => {
  if (!paramTypes.length) {
    return void 0;
  }
  const typesRegex = paramTypes.map(escapeRegExp).join("|");
  return patternToRegex(`(?:${typesRegex})(?:${pattern})`);
};
var buildQStringPatterns = () => {
  const specialDelimiterMap = {
    "<": ">",
    "[": "]",
    "(": ")",
    "{": "}"
  };
  const singlePattern = "{left}(?:(?!{right}').)*?{right}";
  const patternList = Object.entries(specialDelimiterMap).map(([left, right]) => singlePattern.replace(/{left}/g, escapeRegExp(left)).replace(/{right}/g, escapeRegExp(right)));
  const specialDelimiters = escapeRegExp(Object.keys(specialDelimiterMap).join(""));
  const standardDelimiterPattern = String.raw`(?<tag>[^\s${specialDelimiters}])(?:(?!\k<tag>').)*?\k<tag>`;
  const qStringPattern = `[Qq]'(?:${standardDelimiterPattern}|${patternList.join("|")})'`;
  return qStringPattern;
};
var quotePatterns = {
  // - backtick quoted (using `` to escape)
  "``": "(?:`[^`]*`)+",
  // - Transact-SQL square bracket quoted (using ]] to escape)
  "[]": String.raw`(?:\[[^\]]*\])(?:\][^\]]*\])*`,
  // double-quoted
  '""-qq': String.raw`(?:"[^"]*")+`,
  '""-bs': String.raw`(?:"[^"\\]*(?:\\.[^"\\]*)*")`,
  '""-qq-bs': String.raw`(?:"[^"\\]*(?:\\.[^"\\]*)*")+`,
  '""-raw': String.raw`(?:"[^"]*")`,
  // single-quoted
  "''-qq": String.raw`(?:'[^']*')+`,
  "''-bs": String.raw`(?:'[^'\\]*(?:\\.[^'\\]*)*')`,
  "''-qq-bs": String.raw`(?:'[^'\\]*(?:\\.[^'\\]*)*')+`,
  "''-raw": String.raw`(?:'[^']*')`,
  // PostgreSQL dollar-quoted
  "$$": String.raw`(?<tag>\$\w*\$)[\s\S]*?\k<tag>`,
  // BigQuery '''triple-quoted''' (using \' to escape)
  "'''..'''": String.raw`'''[^\\]*?(?:\\.[^\\]*?)*?'''`,
  // BigQuery """triple-quoted""" (using \" to escape)
  '""".."""': String.raw`"""[^\\]*?(?:\\.[^\\]*?)*?"""`,
  // Hive and Spark variables: ${name}
  "{}": String.raw`(?:\{[^\}]*\})`,
  // Oracle q'' strings: q'<text>' q'|text|' ...
  "q''": buildQStringPatterns()
};
var singleQuotePattern = (quoteTypes) => {
  if (typeof quoteTypes === "string") {
    return quotePatterns[quoteTypes];
  } else if ("regex" in quoteTypes) {
    return quoteTypes.regex;
  } else {
    return prefixesPattern(quoteTypes) + quotePatterns[quoteTypes.quote];
  }
};
var variable = (varTypes) => patternToRegex(varTypes.map((varType) => "regex" in varType ? varType.regex : singleQuotePattern(varType)).join("|"));
var stringPattern = (quoteTypes) => quoteTypes.map(singleQuotePattern).join("|");
var string = (quoteTypes) => patternToRegex(stringPattern(quoteTypes));
var identifier = (specialChars = {}) => patternToRegex(identifierPattern(specialChars));
var identifierPattern = ({ first, rest, dashes, allowFirstCharNumber } = {}) => {
  const letter = "\\p{Alphabetic}\\p{Mark}_";
  const number = "\\p{Decimal_Number}";
  const firstChars = escapeRegExp(first !== null && first !== void 0 ? first : "");
  const restChars = escapeRegExp(rest !== null && rest !== void 0 ? rest : "");
  const pattern = allowFirstCharNumber ? `[${letter}${number}${firstChars}][${letter}${number}${restChars}]*` : `[${letter}${firstChars}][${letter}${number}${restChars}]*`;
  return dashes ? withDashes(pattern) : pattern;
};

// node_modules/sql-formatter/dist/esm/lexer/lineColFromIndex.js
function lineColFromIndex(source, index) {
  const lines = source.slice(0, index).split(/\n/);
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

// node_modules/sql-formatter/dist/esm/lexer/TokenizerEngine.js
var TokenizerEngine = class {
  constructor(rules, dialectName) {
    this.rules = rules;
    this.dialectName = dialectName;
    this.input = "";
    this.index = 0;
  }
  /**
   * Takes a SQL string and breaks it into tokens.
   * Each token is an object with type and value.
   *
   * @param {string} input - The SQL string
   * @returns {Token[]} output token stream
   */
  tokenize(input) {
    this.input = input;
    this.index = 0;
    const tokens = [];
    let token;
    while (this.index < this.input.length) {
      const precedingWhitespace = this.getWhitespace();
      if (this.index < this.input.length) {
        token = this.getNextToken();
        if (!token) {
          throw this.createParseError();
        }
        tokens.push(Object.assign(Object.assign({}, token), { precedingWhitespace }));
      }
    }
    return tokens;
  }
  createParseError() {
    const text = this.input.slice(this.index, this.index + 10);
    const { line, col } = lineColFromIndex(this.input, this.index);
    return new Error(`Parse error: Unexpected "${text}" at line ${line} column ${col}.
${this.dialectInfo()}`);
  }
  dialectInfo() {
    if (this.dialectName === "sql") {
      return `This likely happens because you're using the default "sql" dialect.
If possible, please select a more specific dialect (like sqlite, postgresql, etc).`;
    } else {
      return `SQL dialect used: "${this.dialectName}".`;
    }
  }
  getWhitespace() {
    WHITESPACE_REGEX.lastIndex = this.index;
    const matches = WHITESPACE_REGEX.exec(this.input);
    if (matches) {
      this.index += matches[0].length;
      return matches[0];
    }
    return void 0;
  }
  getNextToken() {
    for (const rule of this.rules) {
      const token = this.match(rule);
      if (token) {
        return token;
      }
    }
    return void 0;
  }
  // Attempts to match token rule regex at current position in input
  match(rule) {
    rule.regex.lastIndex = this.index;
    const matches = rule.regex.exec(this.input);
    if (matches) {
      const matchedText = matches[0];
      const token = {
        type: rule.type,
        raw: matchedText,
        text: rule.text ? rule.text(matchedText) : matchedText,
        start: this.index
      };
      if (rule.key) {
        token.key = rule.key(matchedText);
      }
      this.index += matchedText.length;
      return token;
    }
    return void 0;
  }
};

// node_modules/sql-formatter/dist/esm/lexer/NestedComment.js
var START = /\/\*/uy;
var ANY_CHAR = /[\s\S]/uy;
var END2 = /\*\//uy;
var NestedComment = class {
  constructor() {
    this.lastIndex = 0;
  }
  exec(input) {
    let result = "";
    let match;
    let nestLevel = 0;
    if (match = this.matchSection(START, input)) {
      result += match;
      nestLevel++;
    } else {
      return null;
    }
    while (nestLevel > 0) {
      if (match = this.matchSection(START, input)) {
        result += match;
        nestLevel++;
      } else if (match = this.matchSection(END2, input)) {
        result += match;
        nestLevel--;
      } else if (match = this.matchSection(ANY_CHAR, input)) {
        result += match;
      } else {
        return null;
      }
    }
    return [result];
  }
  matchSection(regex, input) {
    regex.lastIndex = this.lastIndex;
    const matches = regex.exec(input);
    if (matches) {
      this.lastIndex += matches[0].length;
    }
    return matches ? matches[0] : null;
  }
};

// node_modules/sql-formatter/dist/esm/lexer/Tokenizer.js
var Tokenizer = class {
  constructor(cfg, dialectName) {
    this.cfg = cfg;
    this.dialectName = dialectName;
    this.rulesBeforeParams = this.buildRulesBeforeParams(cfg);
    this.rulesAfterParams = this.buildRulesAfterParams(cfg);
  }
  tokenize(input, paramTypesOverrides) {
    const rules = [
      ...this.rulesBeforeParams,
      ...this.buildParamRules(this.cfg, paramTypesOverrides),
      ...this.rulesAfterParams
    ];
    const tokens = new TokenizerEngine(rules, this.dialectName).tokenize(input);
    return this.cfg.postProcess ? this.cfg.postProcess(tokens) : tokens;
  }
  // These rules can be cached as they only depend on
  // the Tokenizer config options specified for each SQL dialect
  buildRulesBeforeParams(cfg) {
    var _a, _b, _c;
    return this.validRules([
      {
        type: TokenType.DISABLE_COMMENT,
        regex: /(\/\* *sql-formatter-disable *\*\/[\s\S]*?(?:\/\* *sql-formatter-enable *\*\/|$))/uy
      },
      {
        type: TokenType.BLOCK_COMMENT,
        regex: cfg.nestedBlockComments ? new NestedComment() : /(\/\*[^]*?\*\/)/uy
      },
      {
        type: TokenType.LINE_COMMENT,
        regex: lineComment((_a = cfg.lineCommentTypes) !== null && _a !== void 0 ? _a : ["--"])
      },
      {
        type: TokenType.QUOTED_IDENTIFIER,
        regex: string(cfg.identTypes)
      },
      {
        type: TokenType.NUMBER,
        regex: cfg.underscoresInNumbers ? /(?:0x[0-9a-fA-F_]+|0b[01_]+|(?:-\s*)?(?:[0-9_]*\.[0-9_]+|[0-9_]+(?:\.[0-9_]*)?)(?:[eE][-+]?[0-9_]+(?:\.[0-9_]+)?)?)(?![\w\p{Alphabetic}])/uy : /(?:0x[0-9a-fA-F]+|0b[01]+|(?:-\s*)?(?:[0-9]*\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+(?:\.[0-9]+)?)?)(?![\w\p{Alphabetic}])/uy
      },
      // RESERVED_KEYWORD_PHRASE and RESERVED_DATA_TYPE_PHRASE  is matched before all other keyword tokens
      // to e.g. prioritize matching "TIMESTAMP WITH TIME ZONE" phrase over "WITH" clause.
      {
        type: TokenType.RESERVED_KEYWORD_PHRASE,
        regex: reservedWord((_b = cfg.reservedKeywordPhrases) !== null && _b !== void 0 ? _b : [], cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_DATA_TYPE_PHRASE,
        regex: reservedWord((_c = cfg.reservedDataTypePhrases) !== null && _c !== void 0 ? _c : [], cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.CASE,
        regex: /CASE\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.END,
        regex: /END\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.BETWEEN,
        regex: /BETWEEN\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.LIMIT,
        regex: cfg.reservedClauses.includes("LIMIT") ? /LIMIT\b/iuy : void 0,
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_CLAUSE,
        regex: reservedWord(cfg.reservedClauses, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_SELECT,
        regex: reservedWord(cfg.reservedSelect, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_SET_OPERATION,
        regex: reservedWord(cfg.reservedSetOperations, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.WHEN,
        regex: /WHEN\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.ELSE,
        regex: /ELSE\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.THEN,
        regex: /THEN\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_JOIN,
        regex: reservedWord(cfg.reservedJoins, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.AND,
        regex: /AND\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.OR,
        regex: /OR\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.XOR,
        regex: cfg.supportsXor ? /XOR\b/iuy : void 0,
        text: toCanonical
      },
      ...cfg.operatorKeyword ? [
        {
          type: TokenType.OPERATOR,
          regex: /OPERATOR *\([^)]+\)/iuy
        }
      ] : [],
      {
        type: TokenType.RESERVED_FUNCTION_NAME,
        regex: reservedWord(cfg.reservedFunctionNames, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_DATA_TYPE,
        regex: reservedWord(cfg.reservedDataTypes, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_KEYWORD,
        regex: reservedWord(cfg.reservedKeywords, cfg.identChars),
        text: toCanonical
      }
    ]);
  }
  // These rules can also be cached as they only depend on
  // the Tokenizer config options specified for each SQL dialect
  buildRulesAfterParams(cfg) {
    var _a, _b;
    return this.validRules([
      {
        type: TokenType.VARIABLE,
        regex: cfg.variableTypes ? variable(cfg.variableTypes) : void 0
      },
      { type: TokenType.STRING, regex: string(cfg.stringTypes) },
      {
        type: TokenType.IDENTIFIER,
        regex: identifier(cfg.identChars)
      },
      { type: TokenType.DELIMITER, regex: /[;]/uy },
      { type: TokenType.COMMA, regex: /[,]/y },
      {
        type: TokenType.OPEN_PAREN,
        regex: parenthesis("open", cfg.extraParens)
      },
      {
        type: TokenType.CLOSE_PAREN,
        regex: parenthesis("close", cfg.extraParens)
      },
      {
        type: TokenType.OPERATOR,
        regex: operator([
          // standard operators
          "+",
          "-",
          "/",
          ">",
          "<",
          "=",
          "<>",
          "<=",
          ">=",
          "!=",
          ...(_a = cfg.operators) !== null && _a !== void 0 ? _a : []
        ])
      },
      { type: TokenType.ASTERISK, regex: /[*]/uy },
      {
        type: TokenType.PROPERTY_ACCESS_OPERATOR,
        regex: operator([".", ...(_b = cfg.propertyAccessOperators) !== null && _b !== void 0 ? _b : []])
      }
    ]);
  }
  // These rules can't be blindly cached as the paramTypesOverrides object
  // can differ on each invocation of the format() function.
  buildParamRules(cfg, paramTypesOverrides) {
    var _a, _b, _c, _d, _e;
    const paramTypes = {
      named: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.named) || ((_a = cfg.paramTypes) === null || _a === void 0 ? void 0 : _a.named) || [],
      quoted: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.quoted) || ((_b = cfg.paramTypes) === null || _b === void 0 ? void 0 : _b.quoted) || [],
      numbered: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.numbered) || ((_c = cfg.paramTypes) === null || _c === void 0 ? void 0 : _c.numbered) || [],
      positional: typeof (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.positional) === "boolean" ? paramTypesOverrides.positional : (_d = cfg.paramTypes) === null || _d === void 0 ? void 0 : _d.positional,
      custom: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.custom) || ((_e = cfg.paramTypes) === null || _e === void 0 ? void 0 : _e.custom) || []
    };
    return this.validRules([
      {
        type: TokenType.NAMED_PARAMETER,
        regex: parameter(paramTypes.named, identifierPattern(cfg.paramChars || cfg.identChars)),
        key: (v) => v.slice(1)
      },
      {
        type: TokenType.QUOTED_PARAMETER,
        regex: parameter(paramTypes.quoted, stringPattern(cfg.identTypes)),
        key: (v) => (({ tokenKey, quoteChar }) => tokenKey.replace(new RegExp(escapeRegExp("\\" + quoteChar), "gu"), quoteChar))({
          tokenKey: v.slice(2, -1),
          quoteChar: v.slice(-1)
        })
      },
      {
        type: TokenType.NUMBERED_PARAMETER,
        regex: parameter(paramTypes.numbered, "[0-9]+"),
        key: (v) => v.slice(1)
      },
      {
        type: TokenType.POSITIONAL_PARAMETER,
        regex: paramTypes.positional ? /[?]/y : void 0
      },
      ...paramTypes.custom.map((customParam) => {
        var _a2;
        return {
          type: TokenType.CUSTOM_PARAMETER,
          regex: patternToRegex(customParam.regex),
          key: (_a2 = customParam.key) !== null && _a2 !== void 0 ? _a2 : ((v) => v)
        };
      })
    ]);
  }
  // filters out rules for token types whose regex is undefined
  validRules(rules) {
    return rules.filter((rule) => Boolean(rule.regex));
  }
};
var toCanonical = (v) => equalizeWhitespace(v.toUpperCase());

// node_modules/sql-formatter/dist/esm/dialect.js
var cache = /* @__PURE__ */ new Map();
var createDialect = (options) => {
  let dialect = cache.get(options);
  if (!dialect) {
    dialect = dialectFromOptions(options);
    cache.set(options, dialect);
  }
  return dialect;
};
var dialectFromOptions = (dialectOptions) => ({
  tokenizer: new Tokenizer(dialectOptions.tokenizerOptions, dialectOptions.name),
  formatOptions: processDialectFormatOptions(dialectOptions.formatOptions)
});
var processDialectFormatOptions = (options) => {
  var _a;
  return {
    alwaysDenseOperators: options.alwaysDenseOperators || [],
    onelineClauses: Object.fromEntries(options.onelineClauses.map((name) => [name, true])),
    tabularOnelineClauses: Object.fromEntries(((_a = options.tabularOnelineClauses) !== null && _a !== void 0 ? _a : options.onelineClauses).map((name) => [name, true]))
  };
};

// node_modules/sql-formatter/dist/esm/formatter/config.js
function indentString2(cfg) {
  if (cfg.indentStyle === "tabularLeft" || cfg.indentStyle === "tabularRight") {
    return " ".repeat(10);
  }
  if (cfg.useTabs) {
    return "	";
  }
  return " ".repeat(cfg.tabWidth);
}
function isTabularStyle(cfg) {
  return cfg.indentStyle === "tabularLeft" || cfg.indentStyle === "tabularRight";
}

// node_modules/sql-formatter/dist/esm/formatter/Params.js
var Params = class {
  constructor(params) {
    this.params = params;
    this.index = 0;
  }
  /**
   * Returns param value that matches given placeholder with param key.
   */
  get({ key, text }) {
    if (!this.params) {
      return text;
    }
    if (key) {
      return this.params[key];
    }
    return this.params[this.index++];
  }
  /**
   * Returns index of current positional parameter.
   */
  getPositionalParameterIndex() {
    return this.index;
  }
  /**
   * Sets index of current positional parameter.
   */
  setPositionalParameterIndex(i) {
    this.index = i;
  }
};

// node_modules/sql-formatter/dist/esm/parser/createParser.js
var import_nearley = __toESM(require_nearley(), 1);

// node_modules/sql-formatter/dist/esm/lexer/disambiguateTokens.js
function disambiguateTokens(tokens) {
  return tokens.map(propertyNameKeywordToIdent).map(funcNameToIdent).map(dataTypeToParameterizedDataType).map(identToArrayIdent).map(dataTypeToArrayKeyword);
}
var propertyNameKeywordToIdent = (token, i, tokens) => {
  if (isReserved(token.type)) {
    const prevToken = prevNonCommentToken(tokens, i);
    if (prevToken && prevToken.type === TokenType.PROPERTY_ACCESS_OPERATOR) {
      return Object.assign(Object.assign({}, token), { type: TokenType.IDENTIFIER, text: token.raw });
    }
    const nextToken = nextNonCommentToken(tokens, i);
    if (nextToken && nextToken.type === TokenType.PROPERTY_ACCESS_OPERATOR) {
      return Object.assign(Object.assign({}, token), { type: TokenType.IDENTIFIER, text: token.raw });
    }
  }
  return token;
};
var funcNameToIdent = (token, i, tokens) => {
  if (token.type === TokenType.RESERVED_FUNCTION_NAME) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (!nextToken || !isOpenParen(nextToken)) {
      return Object.assign(Object.assign({}, token), { type: TokenType.IDENTIFIER, text: token.raw });
    }
  }
  return token;
};
var dataTypeToParameterizedDataType = (token, i, tokens) => {
  if (token.type === TokenType.RESERVED_DATA_TYPE) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (nextToken && isOpenParen(nextToken)) {
      return Object.assign(Object.assign({}, token), { type: TokenType.RESERVED_PARAMETERIZED_DATA_TYPE });
    }
  }
  return token;
};
var identToArrayIdent = (token, i, tokens) => {
  if (token.type === TokenType.IDENTIFIER) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (nextToken && isOpenBracket(nextToken)) {
      return Object.assign(Object.assign({}, token), { type: TokenType.ARRAY_IDENTIFIER });
    }
  }
  return token;
};
var dataTypeToArrayKeyword = (token, i, tokens) => {
  if (token.type === TokenType.RESERVED_DATA_TYPE) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (nextToken && isOpenBracket(nextToken)) {
      return Object.assign(Object.assign({}, token), { type: TokenType.ARRAY_KEYWORD });
    }
  }
  return token;
};
var prevNonCommentToken = (tokens, index) => nextNonCommentToken(tokens, index, -1);
var nextNonCommentToken = (tokens, index, dir = 1) => {
  let i = 1;
  while (tokens[index + i * dir] && isComment(tokens[index + i * dir])) {
    i++;
  }
  return tokens[index + i * dir];
};
var isOpenParen = (t) => t.type === TokenType.OPEN_PAREN && t.text === "(";
var isOpenBracket = (t) => t.type === TokenType.OPEN_PAREN && t.text === "[";
var isComment = (t) => t.type === TokenType.BLOCK_COMMENT || t.type === TokenType.LINE_COMMENT;

// node_modules/sql-formatter/dist/esm/parser/LexerAdapter.js
var LexerAdapter = class {
  constructor(tokenize) {
    this.tokenize = tokenize;
    this.index = 0;
    this.tokens = [];
    this.input = "";
  }
  reset(chunk, _info) {
    this.input = chunk;
    this.index = 0;
    this.tokens = this.tokenize(chunk);
  }
  next() {
    return this.tokens[this.index++];
  }
  save() {
  }
  formatError(token) {
    const { line, col } = lineColFromIndex(this.input, token.start);
    return `Parse error at token: ${token.text} at line ${line} column ${col}`;
  }
  has(name) {
    return name in TokenType;
  }
};

// node_modules/sql-formatter/dist/esm/parser/ast.js
var NodeType;
(function(NodeType2) {
  NodeType2["statement"] = "statement";
  NodeType2["clause"] = "clause";
  NodeType2["set_operation"] = "set_operation";
  NodeType2["function_call"] = "function_call";
  NodeType2["parameterized_data_type"] = "parameterized_data_type";
  NodeType2["array_subscript"] = "array_subscript";
  NodeType2["property_access"] = "property_access";
  NodeType2["parenthesis"] = "parenthesis";
  NodeType2["between_predicate"] = "between_predicate";
  NodeType2["case_expression"] = "case_expression";
  NodeType2["case_when"] = "case_when";
  NodeType2["case_else"] = "case_else";
  NodeType2["limit_clause"] = "limit_clause";
  NodeType2["all_columns_asterisk"] = "all_columns_asterisk";
  NodeType2["literal"] = "literal";
  NodeType2["identifier"] = "identifier";
  NodeType2["keyword"] = "keyword";
  NodeType2["data_type"] = "data_type";
  NodeType2["parameter"] = "parameter";
  NodeType2["operator"] = "operator";
  NodeType2["comma"] = "comma";
  NodeType2["line_comment"] = "line_comment";
  NodeType2["block_comment"] = "block_comment";
  NodeType2["disable_comment"] = "disable_comment";
})(NodeType = NodeType || (NodeType = {}));

// node_modules/sql-formatter/dist/esm/parser/grammar.js
function id(d) {
  return d[0];
}
var lexer = new LexerAdapter((chunk) => []);
var unwrap = ([[el]]) => el;
var toKeywordNode = (token) => ({
  type: NodeType.keyword,
  tokenType: token.type,
  text: token.text,
  raw: token.raw
});
var toDataTypeNode = (token) => ({
  type: NodeType.data_type,
  text: token.text,
  raw: token.raw
});
var addComments = (node, { leading, trailing }) => {
  if (leading === null || leading === void 0 ? void 0 : leading.length) {
    node = Object.assign(Object.assign({}, node), { leadingComments: leading });
  }
  if (trailing === null || trailing === void 0 ? void 0 : trailing.length) {
    node = Object.assign(Object.assign({}, node), { trailingComments: trailing });
  }
  return node;
};
var addCommentsToArray = (nodes, { leading, trailing }) => {
  if (leading === null || leading === void 0 ? void 0 : leading.length) {
    const [first, ...rest] = nodes;
    nodes = [addComments(first, { leading }), ...rest];
  }
  if (trailing === null || trailing === void 0 ? void 0 : trailing.length) {
    const lead = nodes.slice(0, -1);
    const last2 = nodes[nodes.length - 1];
    nodes = [...lead, addComments(last2, { trailing })];
  }
  return nodes;
};
var grammar = {
  Lexer: lexer,
  ParserRules: [
    { "name": "main$ebnf$1", "symbols": [] },
    { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", "statement"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "main",
      "symbols": ["main$ebnf$1"],
      "postprocess": ([statements]) => {
        const last2 = statements[statements.length - 1];
        if (last2 && !last2.hasSemicolon) {
          return last2.children.length > 0 ? statements : statements.slice(0, -1);
        } else {
          return statements;
        }
      }
    },
    { "name": "statement$subexpression$1", "symbols": [lexer.has("DELIMITER") ? { type: "DELIMITER" } : DELIMITER] },
    { "name": "statement$subexpression$1", "symbols": [lexer.has("EOF") ? { type: "EOF" } : EOF] },
    {
      "name": "statement",
      "symbols": ["expressions_or_clauses", "statement$subexpression$1"],
      "postprocess": ([children, [delimiter]]) => ({
        type: NodeType.statement,
        children,
        hasSemicolon: delimiter.type === TokenType.DELIMITER
      })
    },
    { "name": "expressions_or_clauses$ebnf$1", "symbols": [] },
    { "name": "expressions_or_clauses$ebnf$1", "symbols": ["expressions_or_clauses$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "expressions_or_clauses$ebnf$2", "symbols": [] },
    { "name": "expressions_or_clauses$ebnf$2", "symbols": ["expressions_or_clauses$ebnf$2", "clause"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "expressions_or_clauses",
      "symbols": ["expressions_or_clauses$ebnf$1", "expressions_or_clauses$ebnf$2"],
      "postprocess": ([expressions, clauses]) => [...expressions, ...clauses]
    },
    { "name": "clause$subexpression$1", "symbols": ["limit_clause"] },
    { "name": "clause$subexpression$1", "symbols": ["select_clause"] },
    { "name": "clause$subexpression$1", "symbols": ["other_clause"] },
    { "name": "clause$subexpression$1", "symbols": ["set_operation"] },
    { "name": "clause", "symbols": ["clause$subexpression$1"], "postprocess": unwrap },
    { "name": "limit_clause$ebnf$1$subexpression$1$ebnf$1", "symbols": ["free_form_sql"] },
    { "name": "limit_clause$ebnf$1$subexpression$1$ebnf$1", "symbols": ["limit_clause$ebnf$1$subexpression$1$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "limit_clause$ebnf$1$subexpression$1", "symbols": [lexer.has("COMMA") ? { type: "COMMA" } : COMMA, "limit_clause$ebnf$1$subexpression$1$ebnf$1"] },
    { "name": "limit_clause$ebnf$1", "symbols": ["limit_clause$ebnf$1$subexpression$1"], "postprocess": id },
    { "name": "limit_clause$ebnf$1", "symbols": [], "postprocess": () => null },
    {
      "name": "limit_clause",
      "symbols": [lexer.has("LIMIT") ? { type: "LIMIT" } : LIMIT, "_", "expression_chain_", "limit_clause$ebnf$1"],
      "postprocess": ([limitToken, _, exp1, optional]) => {
        if (optional) {
          const [comma, exp2] = optional;
          return {
            type: NodeType.limit_clause,
            limitKw: addComments(toKeywordNode(limitToken), { trailing: _ }),
            offset: exp1,
            count: exp2
          };
        } else {
          return {
            type: NodeType.limit_clause,
            limitKw: addComments(toKeywordNode(limitToken), { trailing: _ }),
            count: exp1
          };
        }
      }
    },
    { "name": "select_clause$subexpression$1$ebnf$1", "symbols": [] },
    { "name": "select_clause$subexpression$1$ebnf$1", "symbols": ["select_clause$subexpression$1$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "select_clause$subexpression$1", "symbols": ["all_columns_asterisk", "select_clause$subexpression$1$ebnf$1"] },
    { "name": "select_clause$subexpression$1$ebnf$2", "symbols": [] },
    { "name": "select_clause$subexpression$1$ebnf$2", "symbols": ["select_clause$subexpression$1$ebnf$2", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "select_clause$subexpression$1", "symbols": ["asteriskless_free_form_sql", "select_clause$subexpression$1$ebnf$2"] },
    {
      "name": "select_clause",
      "symbols": [lexer.has("RESERVED_SELECT") ? { type: "RESERVED_SELECT" } : RESERVED_SELECT, "select_clause$subexpression$1"],
      "postprocess": ([nameToken, [exp, expressions]]) => ({
        type: NodeType.clause,
        nameKw: toKeywordNode(nameToken),
        children: [exp, ...expressions]
      })
    },
    {
      "name": "select_clause",
      "symbols": [lexer.has("RESERVED_SELECT") ? { type: "RESERVED_SELECT" } : RESERVED_SELECT],
      "postprocess": ([nameToken]) => ({
        type: NodeType.clause,
        nameKw: toKeywordNode(nameToken),
        children: []
      })
    },
    {
      "name": "all_columns_asterisk",
      "symbols": [lexer.has("ASTERISK") ? { type: "ASTERISK" } : ASTERISK],
      "postprocess": () => ({ type: NodeType.all_columns_asterisk })
    },
    { "name": "other_clause$ebnf$1", "symbols": [] },
    { "name": "other_clause$ebnf$1", "symbols": ["other_clause$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "other_clause",
      "symbols": [lexer.has("RESERVED_CLAUSE") ? { type: "RESERVED_CLAUSE" } : RESERVED_CLAUSE, "other_clause$ebnf$1"],
      "postprocess": ([nameToken, children]) => ({
        type: NodeType.clause,
        nameKw: toKeywordNode(nameToken),
        children
      })
    },
    { "name": "set_operation$ebnf$1", "symbols": [] },
    { "name": "set_operation$ebnf$1", "symbols": ["set_operation$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "set_operation",
      "symbols": [lexer.has("RESERVED_SET_OPERATION") ? { type: "RESERVED_SET_OPERATION" } : RESERVED_SET_OPERATION, "set_operation$ebnf$1"],
      "postprocess": ([nameToken, children]) => ({
        type: NodeType.set_operation,
        nameKw: toKeywordNode(nameToken),
        children
      })
    },
    { "name": "expression_chain_$ebnf$1", "symbols": ["expression_with_comments_"] },
    { "name": "expression_chain_$ebnf$1", "symbols": ["expression_chain_$ebnf$1", "expression_with_comments_"], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "expression_chain_", "symbols": ["expression_chain_$ebnf$1"], "postprocess": id },
    { "name": "expression_chain$ebnf$1", "symbols": [] },
    { "name": "expression_chain$ebnf$1", "symbols": ["expression_chain$ebnf$1", "_expression_with_comments"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "expression_chain",
      "symbols": ["expression", "expression_chain$ebnf$1"],
      "postprocess": ([expr, chain]) => [expr, ...chain]
    },
    { "name": "andless_expression_chain$ebnf$1", "symbols": [] },
    { "name": "andless_expression_chain$ebnf$1", "symbols": ["andless_expression_chain$ebnf$1", "_andless_expression_with_comments"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "andless_expression_chain",
      "symbols": ["andless_expression", "andless_expression_chain$ebnf$1"],
      "postprocess": ([expr, chain]) => [expr, ...chain]
    },
    {
      "name": "expression_with_comments_",
      "symbols": ["expression", "_"],
      "postprocess": ([expr, _]) => addComments(expr, { trailing: _ })
    },
    {
      "name": "_expression_with_comments",
      "symbols": ["_", "expression"],
      "postprocess": ([_, expr]) => addComments(expr, { leading: _ })
    },
    {
      "name": "_andless_expression_with_comments",
      "symbols": ["_", "andless_expression"],
      "postprocess": ([_, expr]) => addComments(expr, { leading: _ })
    },
    { "name": "free_form_sql$subexpression$1", "symbols": ["asteriskless_free_form_sql"] },
    { "name": "free_form_sql$subexpression$1", "symbols": ["asterisk"] },
    { "name": "free_form_sql", "symbols": ["free_form_sql$subexpression$1"], "postprocess": unwrap },
    { "name": "asteriskless_free_form_sql$subexpression$1", "symbols": ["asteriskless_andless_expression"] },
    { "name": "asteriskless_free_form_sql$subexpression$1", "symbols": ["logic_operator"] },
    { "name": "asteriskless_free_form_sql$subexpression$1", "symbols": ["comma"] },
    { "name": "asteriskless_free_form_sql$subexpression$1", "symbols": ["comment"] },
    { "name": "asteriskless_free_form_sql$subexpression$1", "symbols": ["other_keyword"] },
    { "name": "asteriskless_free_form_sql", "symbols": ["asteriskless_free_form_sql$subexpression$1"], "postprocess": unwrap },
    { "name": "expression$subexpression$1", "symbols": ["andless_expression"] },
    { "name": "expression$subexpression$1", "symbols": ["logic_operator"] },
    { "name": "expression", "symbols": ["expression$subexpression$1"], "postprocess": unwrap },
    { "name": "andless_expression$subexpression$1", "symbols": ["asteriskless_andless_expression"] },
    { "name": "andless_expression$subexpression$1", "symbols": ["asterisk"] },
    { "name": "andless_expression", "symbols": ["andless_expression$subexpression$1"], "postprocess": unwrap },
    { "name": "asteriskless_andless_expression$subexpression$1", "symbols": ["atomic_expression"] },
    { "name": "asteriskless_andless_expression$subexpression$1", "symbols": ["between_predicate"] },
    { "name": "asteriskless_andless_expression$subexpression$1", "symbols": ["case_expression"] },
    { "name": "asteriskless_andless_expression", "symbols": ["asteriskless_andless_expression$subexpression$1"], "postprocess": unwrap },
    { "name": "atomic_expression$subexpression$1", "symbols": ["array_subscript"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["function_call"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["property_access"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["parenthesis"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["curly_braces"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["square_brackets"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["operator"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["identifier"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["parameter"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["literal"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["data_type"] },
    { "name": "atomic_expression$subexpression$1", "symbols": ["keyword"] },
    { "name": "atomic_expression", "symbols": ["atomic_expression$subexpression$1"], "postprocess": unwrap },
    {
      "name": "array_subscript",
      "symbols": [lexer.has("ARRAY_IDENTIFIER") ? { type: "ARRAY_IDENTIFIER" } : ARRAY_IDENTIFIER, "_", "square_brackets"],
      "postprocess": ([arrayToken, _, brackets]) => ({
        type: NodeType.array_subscript,
        array: addComments({ type: NodeType.identifier, quoted: false, text: arrayToken.text }, { trailing: _ }),
        parenthesis: brackets
      })
    },
    {
      "name": "array_subscript",
      "symbols": [lexer.has("ARRAY_KEYWORD") ? { type: "ARRAY_KEYWORD" } : ARRAY_KEYWORD, "_", "square_brackets"],
      "postprocess": ([arrayToken, _, brackets]) => ({
        type: NodeType.array_subscript,
        array: addComments(toKeywordNode(arrayToken), { trailing: _ }),
        parenthesis: brackets
      })
    },
    {
      "name": "function_call",
      "symbols": [lexer.has("RESERVED_FUNCTION_NAME") ? { type: "RESERVED_FUNCTION_NAME" } : RESERVED_FUNCTION_NAME, "_", "parenthesis"],
      "postprocess": ([nameToken, _, parens]) => ({
        type: NodeType.function_call,
        nameKw: addComments(toKeywordNode(nameToken), { trailing: _ }),
        parenthesis: parens
      })
    },
    {
      "name": "parenthesis",
      "symbols": [{ "literal": "(" }, "expressions_or_clauses", { "literal": ")" }],
      "postprocess": ([open, children, close]) => ({
        type: NodeType.parenthesis,
        children,
        openParen: "(",
        closeParen: ")"
      })
    },
    { "name": "curly_braces$ebnf$1", "symbols": [] },
    { "name": "curly_braces$ebnf$1", "symbols": ["curly_braces$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "curly_braces",
      "symbols": [{ "literal": "{" }, "curly_braces$ebnf$1", { "literal": "}" }],
      "postprocess": ([open, children, close]) => ({
        type: NodeType.parenthesis,
        children,
        openParen: "{",
        closeParen: "}"
      })
    },
    { "name": "square_brackets$ebnf$1", "symbols": [] },
    { "name": "square_brackets$ebnf$1", "symbols": ["square_brackets$ebnf$1", "free_form_sql"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "square_brackets",
      "symbols": [{ "literal": "[" }, "square_brackets$ebnf$1", { "literal": "]" }],
      "postprocess": ([open, children, close]) => ({
        type: NodeType.parenthesis,
        children,
        openParen: "[",
        closeParen: "]"
      })
    },
    { "name": "property_access$subexpression$1", "symbols": ["identifier"] },
    { "name": "property_access$subexpression$1", "symbols": ["array_subscript"] },
    { "name": "property_access$subexpression$1", "symbols": ["all_columns_asterisk"] },
    { "name": "property_access$subexpression$1", "symbols": ["parameter"] },
    {
      "name": "property_access",
      "symbols": ["atomic_expression", "_", lexer.has("PROPERTY_ACCESS_OPERATOR") ? { type: "PROPERTY_ACCESS_OPERATOR" } : PROPERTY_ACCESS_OPERATOR, "_", "property_access$subexpression$1"],
      "postprocess": (
        // Allowing property to be <array_subscript> is currently a hack.
        // A better way would be to allow <property_access> on the left side of array_subscript,
        // but we currently can't do that because of another hack that requires
        // %ARRAY_IDENTIFIER on the left side of <array_subscript>.
        ([object, _1, dot, _2, [property]]) => {
          return {
            type: NodeType.property_access,
            object: addComments(object, { trailing: _1 }),
            operator: dot.text,
            property: addComments(property, { leading: _2 })
          };
        }
      )
    },
    {
      "name": "between_predicate",
      "symbols": [lexer.has("BETWEEN") ? { type: "BETWEEN" } : BETWEEN, "_", "andless_expression_chain", "_", lexer.has("AND") ? { type: "AND" } : AND, "_", "andless_expression"],
      "postprocess": ([betweenToken, _1, expr1, _2, andToken, _3, expr2]) => ({
        type: NodeType.between_predicate,
        betweenKw: toKeywordNode(betweenToken),
        expr1: addCommentsToArray(expr1, { leading: _1, trailing: _2 }),
        andKw: toKeywordNode(andToken),
        expr2: [addComments(expr2, { leading: _3 })]
      })
    },
    { "name": "case_expression$ebnf$1", "symbols": ["expression_chain_"], "postprocess": id },
    { "name": "case_expression$ebnf$1", "symbols": [], "postprocess": () => null },
    { "name": "case_expression$ebnf$2", "symbols": [] },
    { "name": "case_expression$ebnf$2", "symbols": ["case_expression$ebnf$2", "case_clause"], "postprocess": (d) => d[0].concat([d[1]]) },
    {
      "name": "case_expression",
      "symbols": [lexer.has("CASE") ? { type: "CASE" } : CASE, "_", "case_expression$ebnf$1", "case_expression$ebnf$2", lexer.has("END") ? { type: "END" } : END],
      "postprocess": ([caseToken, _, expr, clauses, endToken]) => ({
        type: NodeType.case_expression,
        caseKw: addComments(toKeywordNode(caseToken), { trailing: _ }),
        endKw: toKeywordNode(endToken),
        expr: expr || [],
        clauses
      })
    },
    {
      "name": "case_clause",
      "symbols": [lexer.has("WHEN") ? { type: "WHEN" } : WHEN, "_", "expression_chain_", lexer.has("THEN") ? { type: "THEN" } : THEN, "_", "expression_chain_"],
      "postprocess": ([whenToken, _1, cond, thenToken, _2, expr]) => ({
        type: NodeType.case_when,
        whenKw: addComments(toKeywordNode(whenToken), { trailing: _1 }),
        thenKw: addComments(toKeywordNode(thenToken), { trailing: _2 }),
        condition: cond,
        result: expr
      })
    },
    {
      "name": "case_clause",
      "symbols": [lexer.has("ELSE") ? { type: "ELSE" } : ELSE, "_", "expression_chain_"],
      "postprocess": ([elseToken, _, expr]) => ({
        type: NodeType.case_else,
        elseKw: addComments(toKeywordNode(elseToken), { trailing: _ }),
        result: expr
      })
    },
    { "name": "comma$subexpression$1", "symbols": [lexer.has("COMMA") ? { type: "COMMA" } : COMMA] },
    { "name": "comma", "symbols": ["comma$subexpression$1"], "postprocess": ([[token]]) => ({ type: NodeType.comma }) },
    { "name": "asterisk$subexpression$1", "symbols": [lexer.has("ASTERISK") ? { type: "ASTERISK" } : ASTERISK] },
    { "name": "asterisk", "symbols": ["asterisk$subexpression$1"], "postprocess": ([[token]]) => ({ type: NodeType.operator, text: token.text }) },
    { "name": "operator$subexpression$1", "symbols": [lexer.has("OPERATOR") ? { type: "OPERATOR" } : OPERATOR] },
    { "name": "operator", "symbols": ["operator$subexpression$1"], "postprocess": ([[token]]) => ({ type: NodeType.operator, text: token.text }) },
    { "name": "identifier$subexpression$1", "symbols": [lexer.has("IDENTIFIER") ? { type: "IDENTIFIER" } : IDENTIFIER] },
    { "name": "identifier$subexpression$1", "symbols": [lexer.has("QUOTED_IDENTIFIER") ? { type: "QUOTED_IDENTIFIER" } : QUOTED_IDENTIFIER] },
    { "name": "identifier$subexpression$1", "symbols": [lexer.has("VARIABLE") ? { type: "VARIABLE" } : VARIABLE] },
    { "name": "identifier", "symbols": ["identifier$subexpression$1"], "postprocess": ([[token]]) => ({ type: NodeType.identifier, quoted: token.type !== "IDENTIFIER", text: token.text }) },
    { "name": "parameter$subexpression$1", "symbols": [lexer.has("NAMED_PARAMETER") ? { type: "NAMED_PARAMETER" } : NAMED_PARAMETER] },
    { "name": "parameter$subexpression$1", "symbols": [lexer.has("QUOTED_PARAMETER") ? { type: "QUOTED_PARAMETER" } : QUOTED_PARAMETER] },
    { "name": "parameter$subexpression$1", "symbols": [lexer.has("NUMBERED_PARAMETER") ? { type: "NUMBERED_PARAMETER" } : NUMBERED_PARAMETER] },
    { "name": "parameter$subexpression$1", "symbols": [lexer.has("POSITIONAL_PARAMETER") ? { type: "POSITIONAL_PARAMETER" } : POSITIONAL_PARAMETER] },
    { "name": "parameter$subexpression$1", "symbols": [lexer.has("CUSTOM_PARAMETER") ? { type: "CUSTOM_PARAMETER" } : CUSTOM_PARAMETER] },
    { "name": "parameter", "symbols": ["parameter$subexpression$1"], "postprocess": ([[token]]) => ({ type: NodeType.parameter, key: token.key, text: token.text }) },
    { "name": "literal$subexpression$1", "symbols": [lexer.has("NUMBER") ? { type: "NUMBER" } : NUMBER] },
    { "name": "literal$subexpression$1", "symbols": [lexer.has("STRING") ? { type: "STRING" } : STRING] },
    { "name": "literal", "symbols": ["literal$subexpression$1"], "postprocess": ([[token]]) => ({ type: NodeType.literal, text: token.text }) },
    { "name": "keyword$subexpression$1", "symbols": [lexer.has("RESERVED_KEYWORD") ? { type: "RESERVED_KEYWORD" } : RESERVED_KEYWORD] },
    { "name": "keyword$subexpression$1", "symbols": [lexer.has("RESERVED_KEYWORD_PHRASE") ? { type: "RESERVED_KEYWORD_PHRASE" } : RESERVED_KEYWORD_PHRASE] },
    { "name": "keyword$subexpression$1", "symbols": [lexer.has("RESERVED_JOIN") ? { type: "RESERVED_JOIN" } : RESERVED_JOIN] },
    {
      "name": "keyword",
      "symbols": ["keyword$subexpression$1"],
      "postprocess": ([[token]]) => toKeywordNode(token)
    },
    { "name": "data_type$subexpression$1", "symbols": [lexer.has("RESERVED_DATA_TYPE") ? { type: "RESERVED_DATA_TYPE" } : RESERVED_DATA_TYPE] },
    { "name": "data_type$subexpression$1", "symbols": [lexer.has("RESERVED_DATA_TYPE_PHRASE") ? { type: "RESERVED_DATA_TYPE_PHRASE" } : RESERVED_DATA_TYPE_PHRASE] },
    {
      "name": "data_type",
      "symbols": ["data_type$subexpression$1"],
      "postprocess": ([[token]]) => toDataTypeNode(token)
    },
    {
      "name": "data_type",
      "symbols": [lexer.has("RESERVED_PARAMETERIZED_DATA_TYPE") ? { type: "RESERVED_PARAMETERIZED_DATA_TYPE" } : RESERVED_PARAMETERIZED_DATA_TYPE, "_", "parenthesis"],
      "postprocess": ([nameToken, _, parens]) => ({
        type: NodeType.parameterized_data_type,
        dataType: addComments(toDataTypeNode(nameToken), { trailing: _ }),
        parenthesis: parens
      })
    },
    { "name": "logic_operator$subexpression$1", "symbols": [lexer.has("AND") ? { type: "AND" } : AND] },
    { "name": "logic_operator$subexpression$1", "symbols": [lexer.has("OR") ? { type: "OR" } : OR] },
    { "name": "logic_operator$subexpression$1", "symbols": [lexer.has("XOR") ? { type: "XOR" } : XOR] },
    {
      "name": "logic_operator",
      "symbols": ["logic_operator$subexpression$1"],
      "postprocess": ([[token]]) => toKeywordNode(token)
    },
    { "name": "other_keyword$subexpression$1", "symbols": [lexer.has("WHEN") ? { type: "WHEN" } : WHEN] },
    { "name": "other_keyword$subexpression$1", "symbols": [lexer.has("THEN") ? { type: "THEN" } : THEN] },
    { "name": "other_keyword$subexpression$1", "symbols": [lexer.has("ELSE") ? { type: "ELSE" } : ELSE] },
    { "name": "other_keyword$subexpression$1", "symbols": [lexer.has("END") ? { type: "END" } : END] },
    {
      "name": "other_keyword",
      "symbols": ["other_keyword$subexpression$1"],
      "postprocess": ([[token]]) => toKeywordNode(token)
    },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", "comment"], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "_", "symbols": ["_$ebnf$1"], "postprocess": ([comments]) => comments },
    {
      "name": "comment",
      "symbols": [lexer.has("LINE_COMMENT") ? { type: "LINE_COMMENT" } : LINE_COMMENT],
      "postprocess": ([token]) => ({
        type: NodeType.line_comment,
        text: token.text,
        precedingWhitespace: token.precedingWhitespace
      })
    },
    {
      "name": "comment",
      "symbols": [lexer.has("BLOCK_COMMENT") ? { type: "BLOCK_COMMENT" } : BLOCK_COMMENT],
      "postprocess": ([token]) => ({
        type: NodeType.block_comment,
        text: token.text,
        precedingWhitespace: token.precedingWhitespace
      })
    },
    {
      "name": "comment",
      "symbols": [lexer.has("DISABLE_COMMENT") ? { type: "DISABLE_COMMENT" } : DISABLE_COMMENT],
      "postprocess": ([token]) => ({
        type: NodeType.disable_comment,
        text: token.text,
        precedingWhitespace: token.precedingWhitespace
      })
    }
  ],
  ParserStart: "main"
};
var grammar_default = grammar;

// node_modules/sql-formatter/dist/esm/parser/createParser.js
var { Parser: NearleyParser, Grammar } = import_nearley.default;
function createParser(tokenizer) {
  let paramTypesOverrides = {};
  const lexer2 = new LexerAdapter((chunk) => [
    ...disambiguateTokens(tokenizer.tokenize(chunk, paramTypesOverrides)),
    createEofToken(chunk.length)
  ]);
  const parser = new NearleyParser(Grammar.fromCompiled(grammar_default), { lexer: lexer2 });
  return {
    parse: (sql2, paramTypes) => {
      paramTypesOverrides = paramTypes;
      const { results } = parser.feed(sql2);
      if (results.length === 1) {
        return results[0];
      } else if (results.length === 0) {
        throw new Error("Parse error: Invalid SQL");
      } else {
        throw new Error(`Parse error: Ambiguous grammar
${JSON.stringify(results, void 0, 2)}`);
      }
    }
  };
}

// node_modules/sql-formatter/dist/esm/formatter/Layout.js
var WS;
(function(WS2) {
  WS2[WS2["SPACE"] = 0] = "SPACE";
  WS2[WS2["NO_SPACE"] = 1] = "NO_SPACE";
  WS2[WS2["NO_NEWLINE"] = 2] = "NO_NEWLINE";
  WS2[WS2["NEWLINE"] = 3] = "NEWLINE";
  WS2[WS2["MANDATORY_NEWLINE"] = 4] = "MANDATORY_NEWLINE";
  WS2[WS2["INDENT"] = 5] = "INDENT";
  WS2[WS2["SINGLE_INDENT"] = 6] = "SINGLE_INDENT";
})(WS = WS || (WS = {}));
var Layout = class {
  constructor(indentation) {
    this.indentation = indentation;
    this.items = [];
  }
  /**
   * Appends token strings and whitespace modifications to SQL string.
   */
  add(...items) {
    for (const item of items) {
      switch (item) {
        case WS.SPACE:
          this.items.push(WS.SPACE);
          break;
        case WS.NO_SPACE:
          this.trimHorizontalWhitespace();
          break;
        case WS.NO_NEWLINE:
          this.trimWhitespace();
          break;
        case WS.NEWLINE:
          this.trimHorizontalWhitespace();
          this.addNewline(WS.NEWLINE);
          break;
        case WS.MANDATORY_NEWLINE:
          this.trimHorizontalWhitespace();
          this.addNewline(WS.MANDATORY_NEWLINE);
          break;
        case WS.INDENT:
          this.addIndentation();
          break;
        case WS.SINGLE_INDENT:
          this.items.push(WS.SINGLE_INDENT);
          break;
        default:
          this.items.push(item);
      }
    }
  }
  trimHorizontalWhitespace() {
    while (isHorizontalWhitespace(last(this.items))) {
      this.items.pop();
    }
  }
  trimWhitespace() {
    while (isRemovableWhitespace(last(this.items))) {
      this.items.pop();
    }
  }
  addNewline(newline) {
    if (this.items.length > 0) {
      switch (last(this.items)) {
        case WS.NEWLINE:
          this.items.pop();
          this.items.push(newline);
          break;
        case WS.MANDATORY_NEWLINE:
          break;
        default:
          this.items.push(newline);
          break;
      }
    }
  }
  addIndentation() {
    for (let i = 0; i < this.indentation.getLevel(); i++) {
      this.items.push(WS.SINGLE_INDENT);
    }
  }
  /**
   * Returns the final SQL string.
   */
  toString() {
    return this.items.map((item) => this.itemToString(item)).join("");
  }
  /**
   * Returns the internal layout data
   */
  getLayoutItems() {
    return this.items;
  }
  itemToString(item) {
    switch (item) {
      case WS.SPACE:
        return " ";
      case WS.NEWLINE:
      case WS.MANDATORY_NEWLINE:
        return "\n";
      case WS.SINGLE_INDENT:
        return this.indentation.getSingleIndent();
      default:
        return item;
    }
  }
};
var isHorizontalWhitespace = (item) => item === WS.SPACE || item === WS.SINGLE_INDENT;
var isRemovableWhitespace = (item) => item === WS.SPACE || item === WS.SINGLE_INDENT || item === WS.NEWLINE;

// node_modules/sql-formatter/dist/esm/formatter/tabularStyle.js
function toTabularFormat(tokenText, indentStyle) {
  if (indentStyle === "standard") {
    return tokenText;
  }
  let tail = [];
  if (tokenText.length >= 10 && tokenText.includes(" ")) {
    [tokenText, ...tail] = tokenText.split(" ");
  }
  if (indentStyle === "tabularLeft") {
    tokenText = tokenText.padEnd(9, " ");
  } else {
    tokenText = tokenText.padStart(9, " ");
  }
  return tokenText + ["", ...tail].join(" ");
}
function isTabularToken(type2) {
  return isLogicalOperator(type2) || type2 === TokenType.RESERVED_CLAUSE || type2 === TokenType.RESERVED_SELECT || type2 === TokenType.RESERVED_SET_OPERATION || type2 === TokenType.RESERVED_JOIN || type2 === TokenType.LIMIT;
}

// node_modules/sql-formatter/dist/esm/formatter/Indentation.js
var INDENT_TYPE_TOP_LEVEL = "top-level";
var INDENT_TYPE_BLOCK_LEVEL = "block-level";
var Indentation = class {
  /**
   * @param {string} indent A string to indent with
   */
  constructor(indent) {
    this.indent = indent;
    this.indentTypes = [];
  }
  /**
   * Returns indentation string for single indentation step.
   */
  getSingleIndent() {
    return this.indent;
  }
  /**
   * Returns current indentation level
   */
  getLevel() {
    return this.indentTypes.length;
  }
  /**
   * Increases indentation by one top-level indent.
   */
  increaseTopLevel() {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL);
  }
  /**
   * Increases indentation by one block-level indent.
   */
  increaseBlockLevel() {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL);
  }
  /**
   * Decreases indentation by one top-level indent.
   * Does nothing when the previous indent is not top-level.
   */
  decreaseTopLevel() {
    if (this.indentTypes.length > 0 && last(this.indentTypes) === INDENT_TYPE_TOP_LEVEL) {
      this.indentTypes.pop();
    }
  }
  /**
   * Decreases indentation by one block-level indent.
   * If there are top-level indents within the block-level indent,
   * throws away these as well.
   */
  decreaseBlockLevel() {
    while (this.indentTypes.length > 0) {
      const type2 = this.indentTypes.pop();
      if (type2 !== INDENT_TYPE_TOP_LEVEL) {
        break;
      }
    }
  }
};

// node_modules/sql-formatter/dist/esm/formatter/InlineLayout.js
var InlineLayout = class extends Layout {
  constructor(expressionWidth) {
    super(new Indentation(""));
    this.expressionWidth = expressionWidth;
    this.length = 0;
    this.trailingSpace = false;
  }
  add(...items) {
    items.forEach((item) => this.addToLength(item));
    if (this.length > this.expressionWidth) {
      throw new InlineLayoutError();
    }
    super.add(...items);
  }
  addToLength(item) {
    if (typeof item === "string") {
      this.length += item.length;
      this.trailingSpace = false;
    } else if (item === WS.MANDATORY_NEWLINE || item === WS.NEWLINE) {
      throw new InlineLayoutError();
    } else if (item === WS.INDENT || item === WS.SINGLE_INDENT || item === WS.SPACE) {
      if (!this.trailingSpace) {
        this.length++;
        this.trailingSpace = true;
      }
    } else if (item === WS.NO_NEWLINE || item === WS.NO_SPACE) {
      if (this.trailingSpace) {
        this.trailingSpace = false;
        this.length--;
      }
    }
  }
};
var InlineLayoutError = class extends Error {
};

// node_modules/sql-formatter/dist/esm/formatter/ExpressionFormatter.js
var ExpressionFormatter = class _ExpressionFormatter {
  constructor({ cfg, dialectCfg, params, layout, inline = false }) {
    this.inline = false;
    this.nodes = [];
    this.index = -1;
    this.cfg = cfg;
    this.dialectCfg = dialectCfg;
    this.inline = inline;
    this.params = params;
    this.layout = layout;
  }
  format(nodes) {
    this.nodes = nodes;
    for (this.index = 0; this.index < this.nodes.length; this.index++) {
      this.formatNode(this.nodes[this.index]);
    }
    return this.layout;
  }
  formatNode(node) {
    this.formatComments(node.leadingComments);
    this.formatNodeWithoutComments(node);
    this.formatComments(node.trailingComments);
  }
  formatNodeWithoutComments(node) {
    switch (node.type) {
      case NodeType.function_call:
        return this.formatFunctionCall(node);
      case NodeType.parameterized_data_type:
        return this.formatParameterizedDataType(node);
      case NodeType.array_subscript:
        return this.formatArraySubscript(node);
      case NodeType.property_access:
        return this.formatPropertyAccess(node);
      case NodeType.parenthesis:
        return this.formatParenthesis(node);
      case NodeType.between_predicate:
        return this.formatBetweenPredicate(node);
      case NodeType.case_expression:
        return this.formatCaseExpression(node);
      case NodeType.case_when:
        return this.formatCaseWhen(node);
      case NodeType.case_else:
        return this.formatCaseElse(node);
      case NodeType.clause:
        return this.formatClause(node);
      case NodeType.set_operation:
        return this.formatSetOperation(node);
      case NodeType.limit_clause:
        return this.formatLimitClause(node);
      case NodeType.all_columns_asterisk:
        return this.formatAllColumnsAsterisk(node);
      case NodeType.literal:
        return this.formatLiteral(node);
      case NodeType.identifier:
        return this.formatIdentifier(node);
      case NodeType.parameter:
        return this.formatParameter(node);
      case NodeType.operator:
        return this.formatOperator(node);
      case NodeType.comma:
        return this.formatComma(node);
      case NodeType.line_comment:
        return this.formatLineComment(node);
      case NodeType.block_comment:
        return this.formatBlockComment(node);
      case NodeType.disable_comment:
        return this.formatBlockComment(node);
      case NodeType.data_type:
        return this.formatDataType(node);
      case NodeType.keyword:
        return this.formatKeywordNode(node);
    }
  }
  formatFunctionCall(node) {
    this.withComments(node.nameKw, () => {
      this.layout.add(this.showFunctionKw(node.nameKw));
    });
    this.formatNode(node.parenthesis);
  }
  formatParameterizedDataType(node) {
    this.withComments(node.dataType, () => {
      this.layout.add(this.showDataType(node.dataType));
    });
    this.formatNode(node.parenthesis);
  }
  formatArraySubscript(node) {
    let formattedArray;
    switch (node.array.type) {
      case NodeType.data_type:
        formattedArray = this.showDataType(node.array);
        break;
      case NodeType.keyword:
        formattedArray = this.showKw(node.array);
        break;
      default:
        formattedArray = this.showIdentifier(node.array);
        break;
    }
    this.withComments(node.array, () => {
      this.layout.add(formattedArray);
    });
    this.formatNode(node.parenthesis);
  }
  formatPropertyAccess(node) {
    this.formatNode(node.object);
    this.layout.add(WS.NO_SPACE, node.operator);
    this.formatNode(node.property);
  }
  formatParenthesis(node) {
    const inlineLayout = this.formatInlineExpression(node.children);
    if (inlineLayout) {
      this.layout.add(node.openParen);
      this.layout.add(...inlineLayout.getLayoutItems());
      this.layout.add(WS.NO_SPACE, node.closeParen, WS.SPACE);
    } else {
      this.layout.add(node.openParen, WS.NEWLINE);
      if (isTabularStyle(this.cfg)) {
        this.layout.add(WS.INDENT);
        this.layout = this.formatSubExpression(node.children);
      } else {
        this.layout.indentation.increaseBlockLevel();
        this.layout.add(WS.INDENT);
        this.layout = this.formatSubExpression(node.children);
        this.layout.indentation.decreaseBlockLevel();
      }
      this.layout.add(WS.NEWLINE, WS.INDENT, node.closeParen, WS.SPACE);
    }
  }
  formatBetweenPredicate(node) {
    this.layout.add(this.showKw(node.betweenKw), WS.SPACE);
    this.layout = this.formatSubExpression(node.expr1);
    this.layout.add(WS.NO_SPACE, WS.SPACE, this.showNonTabularKw(node.andKw), WS.SPACE);
    this.layout = this.formatSubExpression(node.expr2);
    this.layout.add(WS.SPACE);
  }
  formatCaseExpression(node) {
    this.formatNode(node.caseKw);
    this.layout.indentation.increaseBlockLevel();
    this.layout = this.formatSubExpression(node.expr);
    this.layout = this.formatSubExpression(node.clauses);
    this.layout.indentation.decreaseBlockLevel();
    this.layout.add(WS.NEWLINE, WS.INDENT);
    this.formatNode(node.endKw);
  }
  formatCaseWhen(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT);
    this.formatNode(node.whenKw);
    this.layout = this.formatSubExpression(node.condition);
    this.formatNode(node.thenKw);
    this.layout = this.formatSubExpression(node.result);
  }
  formatCaseElse(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT);
    this.formatNode(node.elseKw);
    this.layout = this.formatSubExpression(node.result);
  }
  formatClause(node) {
    if (this.isOnelineClause(node)) {
      this.formatClauseInOnelineStyle(node);
    } else if (isTabularStyle(this.cfg)) {
      this.formatClauseInTabularStyle(node);
    } else {
      this.formatClauseInIndentedStyle(node);
    }
  }
  isOnelineClause(node) {
    if (isTabularStyle(this.cfg)) {
      return this.dialectCfg.tabularOnelineClauses[node.nameKw.text];
    } else {
      return this.dialectCfg.onelineClauses[node.nameKw.text];
    }
  }
  formatClauseInIndentedStyle(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.NEWLINE);
    this.layout.indentation.increaseTopLevel();
    this.layout.add(WS.INDENT);
    this.layout = this.formatSubExpression(node.children);
    this.layout.indentation.decreaseTopLevel();
  }
  formatClauseInOnelineStyle(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.SPACE);
    this.layout = this.formatSubExpression(node.children);
  }
  formatClauseInTabularStyle(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.SPACE);
    this.layout.indentation.increaseTopLevel();
    this.layout = this.formatSubExpression(node.children);
    this.layout.indentation.decreaseTopLevel();
  }
  formatSetOperation(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.NEWLINE);
    this.layout.add(WS.INDENT);
    this.layout = this.formatSubExpression(node.children);
  }
  formatLimitClause(node) {
    this.withComments(node.limitKw, () => {
      this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.limitKw));
    });
    this.layout.indentation.increaseTopLevel();
    if (isTabularStyle(this.cfg)) {
      this.layout.add(WS.SPACE);
    } else {
      this.layout.add(WS.NEWLINE, WS.INDENT);
    }
    if (node.offset) {
      this.layout = this.formatSubExpression(node.offset);
      this.layout.add(WS.NO_SPACE, ",", WS.SPACE);
      this.layout = this.formatSubExpression(node.count);
    } else {
      this.layout = this.formatSubExpression(node.count);
    }
    this.layout.indentation.decreaseTopLevel();
  }
  formatAllColumnsAsterisk(_node) {
    this.layout.add("*", WS.SPACE);
  }
  formatLiteral(node) {
    this.layout.add(node.text, WS.SPACE);
  }
  formatIdentifier(node) {
    this.layout.add(this.showIdentifier(node), WS.SPACE);
  }
  formatParameter(node) {
    this.layout.add(this.params.get(node), WS.SPACE);
  }
  formatOperator({ text }) {
    if (this.cfg.denseOperators || this.dialectCfg.alwaysDenseOperators.includes(text)) {
      this.layout.add(WS.NO_SPACE, text);
    } else if (text === ":") {
      this.layout.add(WS.NO_SPACE, text, WS.SPACE);
    } else {
      this.layout.add(text, WS.SPACE);
    }
  }
  formatComma(_node) {
    if (!this.inline) {
      this.layout.add(WS.NO_SPACE, ",", WS.NEWLINE, WS.INDENT);
    } else {
      this.layout.add(WS.NO_SPACE, ",", WS.SPACE);
    }
  }
  withComments(node, fn) {
    this.formatComments(node.leadingComments);
    fn();
    this.formatComments(node.trailingComments);
  }
  formatComments(comments) {
    if (!comments) {
      return;
    }
    comments.forEach((com) => {
      if (com.type === NodeType.line_comment) {
        this.formatLineComment(com);
      } else {
        this.formatBlockComment(com);
      }
    });
  }
  formatLineComment(node) {
    if (isMultiline(node.precedingWhitespace || "")) {
      this.layout.add(WS.NEWLINE, WS.INDENT, node.text, WS.MANDATORY_NEWLINE, WS.INDENT);
    } else if (this.layout.getLayoutItems().length > 0) {
      this.layout.add(WS.NO_NEWLINE, WS.SPACE, node.text, WS.MANDATORY_NEWLINE, WS.INDENT);
    } else {
      this.layout.add(node.text, WS.MANDATORY_NEWLINE, WS.INDENT);
    }
  }
  formatBlockComment(node) {
    if (node.type === NodeType.block_comment && this.isMultilineBlockComment(node)) {
      this.splitBlockComment(node.text).forEach((line) => {
        this.layout.add(WS.NEWLINE, WS.INDENT, line);
      });
      this.layout.add(WS.NEWLINE, WS.INDENT);
    } else {
      this.layout.add(node.text, WS.SPACE);
    }
  }
  isMultilineBlockComment(node) {
    return isMultiline(node.text) || isMultiline(node.precedingWhitespace || "");
  }
  isDocComment(comment) {
    const lines = comment.split(/\n/);
    return (
      // first line starts with /* or /**
      /^\/\*\*?$/.test(lines[0]) && // intermediate lines start with *
      lines.slice(1, lines.length - 1).every((line) => /^\s*\*/.test(line)) && // last line ends with */
      /^\s*\*\/$/.test(last(lines))
    );
  }
  // Breaks up block comment to multiple lines.
  // For example this doc-comment (dots representing leading whitespace):
  //
  //   ..../**
  //   .....* Some description here
  //   .....* and here too
  //   .....*/
  //
  // gets broken to this array (note the leading single spaces):
  //
  //   [ '/**',
  //     '.* Some description here',
  //     '.* and here too',
  //     '.*/' ]
  //
  // However, a normal comment (non-doc-comment) like this:
  //
  //   ..../*
  //   ....Some description here
  //   ....*/
  //
  // gets broken to this array (no leading spaces):
  //
  //   [ '/*',
  //     'Some description here',
  //     '*/' ]
  //
  splitBlockComment(comment) {
    if (this.isDocComment(comment)) {
      return comment.split(/\n/).map((line) => {
        if (/^\s*\*/.test(line)) {
          return " " + line.replace(/^\s*/, "");
        } else {
          return line;
        }
      });
    } else {
      return comment.split(/\n/).map((line) => line.replace(/^\s*/, ""));
    }
  }
  formatSubExpression(nodes) {
    return new _ExpressionFormatter({
      cfg: this.cfg,
      dialectCfg: this.dialectCfg,
      params: this.params,
      layout: this.layout,
      inline: this.inline
    }).format(nodes);
  }
  formatInlineExpression(nodes) {
    const oldParamIndex = this.params.getPositionalParameterIndex();
    try {
      return new _ExpressionFormatter({
        cfg: this.cfg,
        dialectCfg: this.dialectCfg,
        params: this.params,
        layout: new InlineLayout(this.cfg.expressionWidth),
        inline: true
      }).format(nodes);
    } catch (e) {
      if (e instanceof InlineLayoutError) {
        this.params.setPositionalParameterIndex(oldParamIndex);
        return void 0;
      } else {
        throw e;
      }
    }
  }
  formatKeywordNode(node) {
    switch (node.tokenType) {
      case TokenType.RESERVED_JOIN:
        return this.formatJoin(node);
      case TokenType.AND:
      case TokenType.OR:
      case TokenType.XOR:
        return this.formatLogicalOperator(node);
      default:
        return this.formatKeyword(node);
    }
  }
  formatJoin(node) {
    if (isTabularStyle(this.cfg)) {
      this.layout.indentation.decreaseTopLevel();
      this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
      this.layout.indentation.increaseTopLevel();
    } else {
      this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
    }
  }
  formatKeyword(node) {
    this.layout.add(this.showKw(node), WS.SPACE);
  }
  formatLogicalOperator(node) {
    if (this.cfg.logicalOperatorNewline === "before") {
      if (isTabularStyle(this.cfg)) {
        this.layout.indentation.decreaseTopLevel();
        this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
        this.layout.indentation.increaseTopLevel();
      } else {
        this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
      }
    } else {
      this.layout.add(this.showKw(node), WS.NEWLINE, WS.INDENT);
    }
  }
  formatDataType(node) {
    this.layout.add(this.showDataType(node), WS.SPACE);
  }
  showKw(node) {
    if (isTabularToken(node.tokenType)) {
      return toTabularFormat(this.showNonTabularKw(node), this.cfg.indentStyle);
    } else {
      return this.showNonTabularKw(node);
    }
  }
  // Like showKw(), but skips tabular formatting
  showNonTabularKw(node) {
    switch (this.cfg.keywordCase) {
      case "preserve":
        return equalizeWhitespace(node.raw);
      case "upper":
        return node.text;
      case "lower":
        return node.text.toLowerCase();
    }
  }
  showFunctionKw(node) {
    if (isTabularToken(node.tokenType)) {
      return toTabularFormat(this.showNonTabularFunctionKw(node), this.cfg.indentStyle);
    } else {
      return this.showNonTabularFunctionKw(node);
    }
  }
  // Like showFunctionKw(), but skips tabular formatting
  showNonTabularFunctionKw(node) {
    switch (this.cfg.functionCase) {
      case "preserve":
        return equalizeWhitespace(node.raw);
      case "upper":
        return node.text;
      case "lower":
        return node.text.toLowerCase();
    }
  }
  showIdentifier(node) {
    if (node.quoted) {
      return node.text;
    } else {
      switch (this.cfg.identifierCase) {
        case "preserve":
          return node.text;
        case "upper":
          return node.text.toUpperCase();
        case "lower":
          return node.text.toLowerCase();
      }
    }
  }
  showDataType(node) {
    switch (this.cfg.dataTypeCase) {
      case "preserve":
        return equalizeWhitespace(node.raw);
      case "upper":
        return node.text;
      case "lower":
        return node.text.toLowerCase();
    }
  }
};

// node_modules/sql-formatter/dist/esm/formatter/Formatter.js
var Formatter = class {
  constructor(dialect, cfg) {
    this.dialect = dialect;
    this.cfg = cfg;
    this.params = new Params(this.cfg.params);
  }
  /**
   * Formats an SQL query.
   * @param {string} query - The SQL query string to be formatted
   * @return {string} The formatter query
   */
  format(query) {
    const ast = this.parse(query);
    const formattedQuery = this.formatAst(ast);
    return formattedQuery.trimEnd();
  }
  parse(query) {
    return createParser(this.dialect.tokenizer).parse(query, this.cfg.paramTypes || {});
  }
  formatAst(statements) {
    return statements.map((stat) => this.formatStatement(stat)).join("\n".repeat(this.cfg.linesBetweenQueries + 1));
  }
  formatStatement(statement) {
    const layout = new ExpressionFormatter({
      cfg: this.cfg,
      dialectCfg: this.dialect.formatOptions,
      params: this.params,
      layout: new Layout(new Indentation(indentString2(this.cfg)))
    }).format(statement.children);
    if (!statement.hasSemicolon) {
    } else if (this.cfg.newlineBeforeSemicolon) {
      layout.add(WS.NEWLINE, ";");
    } else {
      layout.add(WS.NO_NEWLINE, ";");
    }
    return layout.toString();
  }
};

// node_modules/sql-formatter/dist/esm/validateConfig.js
var ConfigError = class extends Error {
};
function validateConfig(cfg) {
  const removedOptions = [
    "multilineLists",
    "newlineBeforeOpenParen",
    "newlineBeforeCloseParen",
    "aliasAs",
    "commaPosition",
    "tabulateAlias"
  ];
  for (const optionName of removedOptions) {
    if (optionName in cfg) {
      throw new ConfigError(`${optionName} config is no more supported.`);
    }
  }
  if (cfg.expressionWidth <= 0) {
    throw new ConfigError(`expressionWidth config must be positive number. Received ${cfg.expressionWidth} instead.`);
  }
  if (cfg.params && !validateParams(cfg.params)) {
    console.warn('WARNING: All "params" option values should be strings.');
  }
  if (cfg.paramTypes && !validateParamTypes(cfg.paramTypes)) {
    throw new ConfigError("Empty regex given in custom paramTypes. That would result in matching infinite amount of parameters.");
  }
  return cfg;
}
function validateParams(params) {
  const paramValues = params instanceof Array ? params : Object.values(params);
  return paramValues.every((p) => typeof p === "string");
}
function validateParamTypes(paramTypes) {
  if (paramTypes.custom && Array.isArray(paramTypes.custom)) {
    return paramTypes.custom.every((p) => p.regex !== "");
  }
  return true;
}

// node_modules/sql-formatter/dist/esm/sqlFormatter.js
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var dialectNameMap = {
  bigquery: "bigquery",
  clickhouse: "clickhouse",
  db2: "db2",
  db2i: "db2i",
  duckdb: "duckdb",
  hive: "hive",
  mariadb: "mariadb",
  mysql: "mysql",
  n1ql: "n1ql",
  plsql: "plsql",
  postgresql: "postgresql",
  redshift: "redshift",
  spark: "spark",
  sqlite: "sqlite",
  sql: "sql",
  tidb: "tidb",
  trino: "trino",
  transactsql: "transactsql",
  tsql: "transactsql",
  singlestoredb: "singlestoredb",
  snowflake: "snowflake"
};
var supportedDialects = Object.keys(dialectNameMap);
var defaultOptions = {
  tabWidth: 2,
  useTabs: false,
  keywordCase: "preserve",
  identifierCase: "preserve",
  dataTypeCase: "preserve",
  functionCase: "preserve",
  indentStyle: "standard",
  logicalOperatorNewline: "before",
  expressionWidth: 50,
  linesBetweenQueries: 1,
  denseOperators: false,
  newlineBeforeSemicolon: false
};
var format = (query, cfg = {}) => {
  if (typeof cfg.language === "string" && !supportedDialects.includes(cfg.language)) {
    throw new ConfigError(`Unsupported SQL dialect: ${cfg.language}`);
  }
  const canonicalDialectName = dialectNameMap[cfg.language || "sql"];
  return formatDialect(query, Object.assign(Object.assign({}, cfg), { dialect: allDialects_exports[canonicalDialectName] }));
};
var formatDialect = (query, _a) => {
  var { dialect } = _a, cfg = __rest(_a, ["dialect"]);
  if (typeof query !== "string") {
    throw new Error("Invalid query argument. Expected string, instead got " + typeof query);
  }
  const options = validateConfig(Object.assign(Object.assign({}, defaultOptions), cfg));
  return new Formatter(createDialect(dialect), options).format(query);
};

// src/js/tools/sql.js
$(document).ready(function() {
  const $input = $("#sql-input");
  const $output = $("#sql-output");
  const $dialect = $("#sql-dialect");
  const $error = $("#sql-error");
  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $output.val("");
      $error.addClass("hidden");
      return;
    }
    try {
      const formatted = format(val, {
        language: $dialect.val(),
        indent: "  ",
        uppercase: true,
        linesBetweenQueries: 2
      });
      $output.val(formatted);
      $error.addClass("hidden");
    } catch (e) {
      $error.removeClass("hidden").text(`Error: ${e.message}`);
      $output.val("");
    }
  };
  $input.on("input", process);
  $dialect.on("change", process);
  $("#sql-clear-btn").on("click", () => {
    $input.val("").focus();
    $output.val("");
    $error.addClass("hidden");
  });
  $("#sql-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});

// src/js/tools/beautify.js
$(document).ready(function() {
  const $input = $("#beautify-input");
  const $output = $("#beautify-output");
  const beautifyHtml = (html) => {
    let tab = "  ";
    let result = "";
    let indent = "";
    html.split(/>\s*</).forEach(function(element) {
      if (element.match(/^\/\w/)) {
        indent = indent.substring(tab.length);
      }
      result += indent + "<" + element + ">\r\n";
      if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input") && !element.startsWith("img") && !element.startsWith("br") && !element.startsWith("hr")) {
        indent += tab;
      }
    });
    return result.substring(1, result.length - 3);
  };
  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $output.val("");
      return;
    }
    const clean = val.replace(/>\s+</g, "><");
    try {
      $output.val(beautifyHtml(clean));
    } catch (e) {
      $output.val(val);
    }
  };
  $input.on("input", process);
  $("#beautify-clear-btn").on("click", () => {
    $input.val("").focus();
    $output.val("");
  });
  $("#beautify-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});

// src/js/tools/cron.js
var import_cronstrue = __toESM(require_cronstrue());
$(document).ready(function() {
  const $input = $("#cron-input");
  const $explanation = $("#cron-explanation");
  const $error = $("#cron-error");
  const examples = [
    "* * * * *",
    "*/15 * * * *",
    "0 0 * * *",
    "0 9-17 * * 1-5",
    "0 0 1 1 *",
    "30 18 * * 1-5",
    "45 23 * * 6",
    "0 0 * * 0"
  ];
  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $explanation.text("Enter an expression above to see the schedule...");
      $error.addClass("hidden");
      updateParts(["-", "-", "-", "-", "-"]);
      return;
    }
    try {
      const parts = val.split(/\s+/);
      if (parts.length < 5) throw new Error("Incomplete expression");
      const desc = import_cronstrue.default.toString(val);
      $explanation.text(desc);
      $error.addClass("hidden");
      updateParts(parts);
    } catch (e) {
      $error.removeClass("hidden").text(`Error: ${e.message}`);
      $explanation.text("Waiting for a valid expression...");
      updateParts(["-", "-", "-", "-", "-"]);
    }
  };
  const updateParts = (parts) => {
    $("#cron-part-min").text(parts[0] || "-");
    $("#cron-part-hour").text(parts[1] || "-");
    $("#cron-part-day").text(parts[2] || "-");
    $("#cron-part-month").text(parts[3] || "-");
    $("#cron-part-week").text(parts[4] || "-");
  };
  $input.on("input", process);
  $("#cron-example-btn").on("click", () => {
    const random = examples[Math.floor(Math.random() * examples.length)];
    $input.val(random);
    process();
  });
  $input.val("0 9 * * 1-5");
  process();
});

// src/js/tools/cidr.js
$(document).ready(function() {
  const $input = $("#cidr-input");
  const $maskSelect = $("#cidr-mask-select");
  const $error = $("#cidr-error");
  const ipToInt = (ip) => {
    return ip.split(".").reduce((res, octet) => (res << 8) + parseInt(octet, 10), 0) >>> 0;
  };
  const intToIp = (int2) => {
    return [
      int2 >>> 24 & 255,
      int2 >>> 16 & 255,
      int2 >>> 8 & 255,
      int2 & 255
    ].join(".");
  };
  const calculate = () => {
    let val = $input.val().trim();
    if (!val) {
      $error.addClass("hidden");
      clearOutputs();
      return;
    }
    let ip = val;
    let bits = parseInt($maskSelect.val(), 10);
    if (val.includes("/")) {
      const parts = val.split("/");
      ip = parts[0];
      bits = parseInt(parts[1], 10);
      if (isNaN(bits) || bits < 0 || bits > 32) {
        $error.removeClass("hidden");
        return;
      }
      $maskSelect.val(bits);
    }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      $error.removeClass("hidden");
      return;
    }
    try {
      const ipInt = ipToInt(ip);
      const maskInt = 4294967295 << 32 - bits >>> 0;
      const networkInt = (ipInt & maskInt) >>> 0;
      const broadcastInt = (networkInt | ~maskInt) >>> 0;
      const hostCount = bits === 32 ? 1 : bits === 31 ? 2 : broadcastInt - networkInt - 1;
      $("#cidr-out-network").text(intToIp(networkInt));
      $("#cidr-out-mask").text(intToIp(maskInt));
      $("#cidr-out-broadcast").text(intToIp(broadcastInt));
      $("#cidr-out-hosts").text(hostCount.toLocaleString());
      $("#cidr-out-first").text(bits >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1));
      $("#cidr-out-last").text(bits >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1));
      $("#cidr-out-hex").text("0x" + maskInt.toString(16).toUpperCase());
      $("#cidr-out-wildcard").text(intToIp(~maskInt >>> 0));
      $error.addClass("hidden");
    } catch (e) {
      $error.removeClass("hidden");
    }
  };
  const clearOutputs = () => {
    $("#cidr-out-network, #cidr-out-mask, #cidr-out-broadcast, #cidr-out-hosts, #cidr-out-first, #cidr-out-last, #cidr-out-hex, #cidr-out-wildcard").text("");
  };
  $input.on("input", calculate);
  $maskSelect.on("change", calculate);
  $(".copy-field").on("click", function() {
    const targetId = $(this).data("from");
    const text = $(`#${targetId}`).text();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
  $input.val("192.168.1.0/24");
  calculate();
});

// src/js/tools/http.js
$(document).ready(function() {
  const codes = [
    { code: 200, title: "OK", desc: "Standard response for successful HTTP requests." },
    { code: 201, title: "Created", desc: "The request has been fulfilled, resulting in the creation of a new resource." },
    { code: 202, title: "Accepted", desc: "The request has been accepted for processing, but the processing has not been completed." },
    { code: 204, title: "No Content", desc: "The server successfully processed the request and is not returning any content." },
    { code: 301, title: "Moved Permanently", desc: "This and all future requests should be directed to the given URI." },
    { code: 302, title: "Found", desc: "Common way of performing redirection." },
    { code: 304, title: "Not Modified", desc: "Indicates that the resource has not been modified since the version specified by the request headers." },
    { code: 400, title: "Bad Request", desc: "The server cannot or will not process the request due to an apparent client error." },
    { code: 401, title: "Unauthorized", desc: "Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided." },
    { code: 403, title: "Forbidden", desc: "The request was valid, but the server is refusing action." },
    { code: 404, title: "Not Found", desc: "The requested resource could not be found but may be available in the future." },
    { code: 405, title: "Method Not Allowed", desc: "A request method is not supported for the requested resource." },
    { code: 408, title: "Request Timeout", desc: "The server timed out waiting for the request." },
    { code: 409, title: "Conflict", desc: "Indicates that the request could not be processed because of conflict in the current state of the resource." },
    { code: 418, title: "I'm a teapot", desc: "The HTTP 418 I'm a teapot client error response code indicates that the server refuses to brew coffee because it is, permanently, a teapot." },
    { code: 422, title: "Unprocessable Entity", desc: "The request was well-formed but was unable to be followed due to semantic errors." },
    { code: 429, title: "Too Many Requests", desc: "The user has sent too many requests in a given amount of time." },
    { code: 500, title: "Internal Server Error", desc: "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable." },
    { code: 501, title: "Not Implemented", desc: "The server either does not recognize the request method, or it lacks the ability to fulfil the request." },
    { code: 502, title: "Bad Gateway", desc: "The server was acting as a gateway or proxy and received an invalid response from the upstream server." },
    { code: 503, title: "Service Unavailable", desc: "The server cannot handle the request (because it is overloaded or down for maintenance)." },
    { code: 504, title: "Gateway Timeout", desc: "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server." }
  ];
  const $grid = $("#http-grid");
  const $search = $("#http-search");
  const render = (filterText = "", category = "all") => {
    $grid.empty();
    const filtered = codes.filter((c) => {
      const matchText = (c.code.toString() + c.title + c.desc).toLowerCase().includes(filterText.toLowerCase());
      const matchCategory = category === "all" || c.code.toString().startsWith(category);
      return matchText && matchCategory;
    });
    filtered.forEach((c) => {
      const colorClass = c.code < 300 ? "text-emerald-400" : c.code < 400 ? "text-blue-400" : c.code < 500 ? "text-amber-400" : "text-rose-400";
      const shadowClass = c.code < 300 ? "shadow-emerald-500/10" : c.code < 400 ? "shadow-blue-500/10" : c.code < 500 ? "shadow-amber-500/10" : "shadow-rose-500/10";
      const card = `
        <div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm hover:border-blue-500/30 transition-all shadow-lg ${shadowClass} group">
          <div class="flex justify-between items-start mb-3">
             <span class="text-3xl font-bold font-mono ${colorClass}">${c.code}</span>
             <button class="copy-code text-gray-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" data-code="${c.code}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
             </button>
          </div>
          <h4 class="text-sm font-bold text-gray-100 mb-2 uppercase tracking-wide">${c.title}</h4>
          <p class="text-xs text-gray-500 leading-relaxed">${c.desc}</p>
        </div>
      `;
      $grid.append(card);
    });
  };
  $search.on("input", function() {
    render($(this).val(), $(".http-filter-btn.bg-blue-600").data("filter"));
  });
  $(".http-filter-btn").on("click", function() {
    $(".http-filter-btn").removeClass("bg-blue-600 text-white shadow-sm").addClass("text-gray-500 hover:text-gray-300");
    $(this).addClass("bg-blue-600 text-white shadow-sm").removeClass("text-gray-500 hover:text-gray-300");
    render($search.val(), $(this).data("filter"));
  });
  $grid.on("click", ".copy-code", function() {
    window.copyToClipboard($(this).data("code").toString(), $(this));
  });
  render();
});

// src/js/tools/mime.js
$(document).ready(function() {
  const mimeData = [
    { ext: ".html", type: "text/html", category: "Text" },
    { ext: ".css", type: "text/css", category: "Text" },
    { ext: ".js", type: "text/javascript", category: "Text" },
    { ext: ".json", type: "application/json", category: "Data" },
    { ext: ".xml", type: "application/xml", category: "Data" },
    { ext: ".png", type: "image/png", category: "Image" },
    { ext: ".jpg", type: "image/jpeg", category: "Image" },
    { ext: ".svg", type: "image/svg+xml", category: "Image" },
    { ext: ".webp", type: "image/webp", category: "Image" },
    { ext: ".pdf", type: "application/pdf", category: "Document" },
    { ext: ".zip", type: "application/zip", category: "Archive" },
    { ext: ".mp3", type: "audio/mpeg", category: "Audio" },
    { ext: ".mp4", type: "video/mp4", category: "Video" },
    { ext: ".csv", type: "text/csv", category: "Data" },
    { ext: ".yaml", type: "application/x-yaml", category: "Data" },
    { ext: ".txt", type: "text/plain", category: "Text" },
    { ext: ".wasm", type: "application/wasm", category: "Data" },
    { ext: ".woff2", type: "font/woff2", category: "Font" },
    { ext: ".ico", type: "image/x-icon", category: "Image" },
    { ext: ".gif", type: "image/gif", category: "Image" }
  ];
  const $input = $("#mime-search");
  const $results = $("#mime-results");
  const $empty = $("#mime-empty");
  const render = (search = "") => {
    $results.empty();
    const query = search.toLowerCase().replace(/^\./, "");
    const filtered = mimeData.filter(
      (m) => m.ext.toLowerCase().includes(query) || m.type.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)
    );
    if (filtered.length === 0) {
      $empty.removeClass("hidden");
    } else {
      $empty.addClass("hidden");
      filtered.forEach((m) => {
        const card = `
          <div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm group hover:border-indigo-500/30 transition-all flex justify-between items-center">
             <div>
                <span class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">${m.category}</span>
                <span class="text-lg font-mono text-indigo-300">${m.ext}</span>
                <span class="block text-sm text-gray-400 mt-1 font-mono">${m.type}</span>
             </div>
             <button class="copy-mime p-2 text-gray-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" data-type="${m.type}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
             </button>
          </div>
        `;
        $results.append(card);
      });
    }
  };
  $input.on("input", function() {
    render($(this).val());
  });
  $results.on("click", ".copy-mime", function() {
    window.copyToClipboard($(this).data("type"), $(this));
  });
  render();
});

// src/js/tools/naming.js
$(document).ready(function() {
  const $input = $("#naming-input");
  const toPascal = (str2) => str2.charAt(0).toUpperCase() + str2.slice(1);
  const toLower = (str2) => str2.toLowerCase();
  const getSuggestions = (subject) => {
    if (!subject) return;
    const subj = toLower(subject);
    const Subj = toPascal(subj);
    const bools = [
      `is${Subj}`,
      `has${Subj}`,
      `can${Subj}`,
      `should${Subj}`,
      `is${Subj}Visible`,
      `is${Subj}Enabled`,
      `was${Subj}Modified`
    ];
    const actions = [
      `get${Subj}`,
      `set${Subj}`,
      `update${Subj}`,
      `delete${Subj}`,
      `fetch${Subj}`,
      `handle${Subj}Change`,
      `validate${Subj}`
    ];
    const lists = [
      `${subj}List`,
      `${subj}Map`,
      `${subj}s`,
      `active${Subj}s`,
      `filtered${Subj}s`,
      `${subj}Count`,
      `total${Subj}s`
    ];
    renderList("#naming-out-bool", bools, "bg-violet-500/10 text-violet-300");
    renderList("#naming-out-action", actions, "bg-emerald-500/10 text-emerald-300");
    renderList("#naming-out-list", lists, "bg-amber-500/10 text-amber-300");
  };
  const renderList = (container, items, classes) => {
    const $c = $(container);
    $c.empty();
    items.forEach((item) => {
      const el = `
        <div class="flex justify-between items-center group/item p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" data-copy="${item}">
           <span class="text-sm font-mono ${classes} px-2 py-1 rounded inline-block">${item}</span>
           <svg class="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
        </div>
      `;
      $c.append(el);
    });
  };
  $input.on("input", function() {
    getSuggestions($(this).val().trim());
  });
  $(".space-y-2").on("click", "[data-copy]", function() {
    window.copyToClipboard($(this).data("copy"), $(this));
  });
  $input.val("user");
  getSuggestions("user");
});

// src/js/tools/pem.js
$(document).ready(function() {
  const $input = $("#pem-input");
  const $details = $("#pem-details");
  const $empty = $("#pem-empty-state");
  const $error = $("#pem-error");
  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $details.addClass("hidden");
      $empty.removeClass("hidden");
      $error.addClass("hidden");
      return;
    }
    if (val.includes("-----BEGIN")) {
      const match = val.match(/-----BEGIN (.*)-----/);
      const type2 = match ? match[1] : "PEM Block";
      $details.removeClass("hidden");
      $empty.addClass("hidden");
      $error.addClass("hidden");
      $("#pem-out-subject").text("Detection logic for X.509 fields requires additional cryptography libraries. Type: " + type2);
      $("#pem-out-issuer").text("-");
      $("#pem-out-start").text("-");
      $("#pem-out-end").text("-");
      $("#pem-out-serial").text("-");
      $("#pem-type-badge").text(type2);
    } else {
      $error.removeClass("hidden").text("Not a valid PEM block (missing BEGIN/END markers)");
      $details.addClass("hidden");
      $empty.removeClass("hidden");
    }
  };
  $input.on("input", process);
  $("#pem-clear-btn").on("click", () => {
    $input.val("").focus();
    process();
  });
});

// src/js/tools/bits.js
$(document).ready(function() {
  const $grid = $("#bits-grid-container");
  const $outHex = $("#bits-out-hex");
  const $outDec = $("#bits-out-dec");
  const $outBin = $("#bits-out-bin");
  const $outCode = $("#bits-out-code");
  let currentValue = 0n;
  const initGrid = () => {
    $grid.empty();
    for (let i = 63; i >= 0; i--) {
      const bitNum = i;
      const html = `
        <div class="bit-item flex flex-col items-center bg-gray-900 border border-gray-700 rounded-lg p-2 cursor-pointer hover:border-emerald-500/50 transition-all select-none group" data-bit="${bitNum}">
           <span class="text-[8px] font-bold text-gray-600 group-hover:text-gray-400 mb-1">${bitNum}</span>
           <div class="bit-indicator w-3 h-3 rounded-sm bg-gray-800 transition-colors"></div>
        </div>
      `;
      $grid.append(html);
    }
  };
  const updateUI = () => {
    $(".bit-item").each(function() {
      const bit = BigInt($(this).data("bit"));
      const isOn = (currentValue & 1n << bit) !== 0n;
      $(this).find(".bit-indicator").toggleClass("bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]", isOn).toggleClass("bg-gray-800", !isOn);
    });
    const hex = "0x" + currentValue.toString(16).toUpperCase().padStart(16, "0");
    $outHex.val(hex);
    $outDec.val(currentValue.toString());
    const bin = currentValue.toString(2).padStart(64, "0").match(/.{8}/g).join(" ");
    $outBin.text(bin);
    $outCode.text(`#define MASK ${hex}ULL`);
  };
  $grid.on("click", ".bit-item", function() {
    const bit = BigInt($(this).data("bit"));
    currentValue ^= 1n << bit;
    updateUI();
  });
  $outHex.on("input", function() {
    try {
      let val = $(this).val().trim();
      if (!val.startsWith("0x")) val = "0x" + val;
      currentValue = BigInt(val);
      updateUI();
    } catch (e) {
    }
  });
  $outDec.on("input", function() {
    try {
      currentValue = BigInt($(this).val());
      updateUI();
    } catch (e) {
    }
  });
  $("#bits-clear").on("click", () => {
    currentValue = 0n;
    updateUI();
  });
  $("#bits-set-all").on("click", () => {
    currentValue = 0xFFFFFFFFFFFFFFFFn;
    updateUI();
  });
  $("#bits-invert").on("click", () => {
    currentValue = ~currentValue & 0xFFFFFFFFFFFFFFFFn;
    updateUI();
  });
  initGrid();
  updateUI();
});

// src/js/tools/crc.js
$(document).ready(function() {
  const $input = $("#crc-input");
  const $output = $("#crc-output");
  const $algo = $("#crc-algo");
  const $error = $("#crc-error");
  let inputMode = "text";
  const stringToBytes = (str2) => {
    return new TextEncoder().encode(str2);
  };
  const hexToBytes = (hex) => {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0) throw new Error("Invalid hex");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
  };
  const calcCrc8 = (data) => {
    let crc = 0;
    for (let b of data) {
      crc ^= b;
      for (let i = 0; i < 8; i++) {
        if (crc & 128) crc = crc << 1 ^ 7;
        else crc <<= 1;
      }
    }
    return (crc & 255).toString(16).toUpperCase().padStart(2, "0");
  };
  const calcCrc16Ccitt = (data) => {
    let crc = 0;
    for (let b of data) {
      crc ^= b << 8;
      for (let i = 0; i < 8; i++) {
        if (crc & 32768) crc = crc << 1 ^ 4129;
        else crc <<= 1;
      }
    }
    return (crc & 65535).toString(16).toUpperCase().padStart(4, "0");
  };
  const calcCrc32 = (data) => {
    let crc = 4294967295;
    for (let b of data) {
      crc ^= b;
      for (let i = 0; i < 8; i++) {
        if (crc & 1) crc = crc >>> 1 ^ 3988292384;
        else crc >>>= 1;
      }
    }
    return (~crc >>> 0).toString(16).toUpperCase().padStart(8, "0");
  };
  const process = () => {
    const val = $input.val();
    if (!val) {
      $output.text("-");
      $error.addClass("hidden");
      return;
    }
    try {
      const data = inputMode === "text" ? stringToBytes(val) : hexToBytes(val);
      const algo = $algo.val();
      let result = "";
      if (algo === "crc8") result = calcCrc8(data);
      else if (algo === "crc16ccitt") result = calcCrc16Ccitt(data);
      else if (algo === "crc32") result = calcCrc32(data);
      else if (algo === "xor") {
        let sum = 0;
        for (let b of data) sum ^= b;
        result = sum.toString(16).toUpperCase().padStart(2, "0");
      } else if (algo === "sum8") {
        let sum = 0;
        for (let b of data) sum = sum + b & 255;
        result = sum.toString(16).toUpperCase().padStart(2, "0");
      }
      $output.text(result);
      $error.addClass("hidden");
    } catch (e) {
      $error.removeClass("hidden").text(e.message);
      $output.text("-");
    }
  };
  $input.on("input", process);
  $algo.on("change", process);
  $("#crc-input-type-text").on("click", () => {
    inputMode = "text";
    $("#crc-input-type-text").addClass("bg-blue-600 text-white").removeClass("text-gray-500");
    $("#crc-input-type-hex").removeClass("bg-blue-600 text-white").addClass("text-gray-500");
    process();
  });
  $("#crc-input-type-hex").on("click", () => {
    inputMode = "hex";
    $("#crc-input-type-hex").addClass("bg-blue-600 text-white").removeClass("text-gray-500");
    $("#crc-input-type-text").removeClass("bg-blue-600 text-white").addClass("text-gray-500");
    process();
  });
  $("#crc-clear-btn").on("click", () => {
    $input.val("").focus();
    process();
  });
  $("#crc-copy-btn").on("click", function() {
    const text = $output.text();
    if (text !== "-") window.copyToClipboard(text, $(this));
  });
});

// src/js/tools/endian.js
$(document).ready(function() {
  const $input = $("#endian-input");
  const $width = $("#endian-width");
  const $outHex = $("#endian-out-hex");
  const $outDec = $("#endian-out-dec");
  const $viz = $("#endian-viz");
  const $error = $("#endian-error");
  const swap16 = (val) => {
    return (val & 255) << 8 | val >> 8 & 255;
  };
  const swap32 = (val) => {
    return (val & 255) << 24 | (val & 65280) << 8 | val >> 8 & 65280 | val >> 24 & 255;
  };
  const swap64 = (val) => {
    let result = 0n;
    for (let i = 0n; i < 8n; i++) {
      const byte = val >> i * 8n & 0xFFn;
      result |= byte << (7n - i) * 8n;
    }
    return result;
  };
  const renderViz = (val, width) => {
    $viz.empty();
    const bytesCount = width / 8;
    const hex = val.toString(16).padStart(width / 4, "0");
    for (let i = 0; i < bytesCount; i++) {
      const byteHex = hex.substring(i * 2, i * 2 + 2).toUpperCase();
      const html = `
            <div class="flex flex-col items-center">
                <div class="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-xs font-mono text-emerald-300 shadow-inner">
                   ${byteHex}
                </div>
                <span class="text-[8px] text-gray-600 mt-1 uppercase font-bold">Byte ${bytesCount - 1 - i}</span>
            </div>
        `;
      $viz.append(html);
      if (i < bytesCount - 1) {
        $viz.append('<div class="h-10 flex items-center text-gray-700">\u21C6</div>');
      }
    }
  };
  const process = () => {
    const raw = $input.val().trim();
    if (!raw) {
      $outHex.text("0x00000000");
      $outDec.text("0");
      $viz.empty();
      $error.addClass("hidden");
      return;
    }
    try {
      let val = raw;
      if (!val.startsWith("0x") && /^[0-9a-fA-F]+$/.test(val) && val.length > 2) val = "0x" + val;
      const width = parseInt($width.val(), 10);
      let numeric = BigInt(val);
      let swapped = 0n;
      if (width === 16) {
        if (numeric > 0xFFFFn) throw new Error("Overflow");
        swapped = BigInt(swap16(Number(numeric)));
      } else if (width === 32) {
        if (numeric > 0xFFFFFFFFn) throw new Error("Overflow");
        swapped = BigInt(swap32(Number(numeric)) >>> 0);
      } else if (width === 64) {
        swapped = swap64(numeric);
      }
      const hexStr = "0x" + swapped.toString(16).toUpperCase().padStart(width / 4, "0");
      $outHex.text(hexStr);
      $outDec.text(swapped.toString());
      renderViz(swapped, width);
      $error.addClass("hidden");
    } catch (e) {
      $error.removeClass("hidden");
      $outHex.text("-");
      $outDec.text("-");
    }
  };
  $input.on("input", process);
  $width.on("change", process);
  $(".endian-copy-btn").on("click", function() {
    const target = $(this).data("from");
    window.copyToClipboard($(`#${target}`).text(), $(this));
  });
  $input.val("0x12345678");
  process();
});

// src/js/tools/carray.js
$(document).ready(function() {
  const $input = $("#carray-input");
  const $output = $("#carray-output");
  const $cols = $("#carray-cols");
  const $name = $("#carray-name");
  const process = () => {
    let raw = $input.val().trim();
    if (!raw) {
      $output.val("");
      return;
    }
    let bytes = [];
    if (/^[01\s]+$/.test(raw)) {
      const bits = raw.replace(/\s+/g, "");
      for (let i = 0; i < bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
      }
    } else {
      const clean = raw.replace(/[^0-9a-fA-F]/g, "");
      for (let i = 0; i < clean.length; i += 2) {
        bytes.push(parseInt(clean.substring(i, i + 2), 16));
      }
    }
    if (bytes.length === 0) {
      $output.val("// No valid hex/binary data found");
      return;
    }
    const varName = $name.val().trim() || "rawData";
    const perLine = parseInt($cols.val(), 10) || 12;
    let result = `const uint8_t ${varName}[${bytes.length}] = {
    `;
    for (let i = 0; i < bytes.length; i++) {
      result += "0x" + bytes[i].toString(16).toUpperCase().padStart(2, "0");
      if (i < bytes.length - 1) {
        result += ", ";
        if ((i + 1) % perLine === 0) result += "\n    ";
      }
    }
    result += "\n};";
    $output.val(result);
  };
  $input.on("input", process);
  $cols.on("input", process);
  $name.on("input", process);
  $("#carray-clear-btn").on("click", () => {
    $input.val("").focus();
    process();
  });
  $("#carray-copy-btn").on("click", function() {
    const text = $output.val();
    if (text) window.copyToClipboard(text, $(this));
  });
  $input.val("DE AD BE EF 12 34 56 78");
  process();
});

// src/js/tools/limits.js
$(document).ready(function() {
  const types2 = [
    { name: "uint8_t", bits: 8, min: "0", max: "255", hmax: "0xFF" },
    { name: "int8_t", bits: 8, min: "-128", max: "127", hmax: "0x7F" },
    { name: "uint16_t", bits: 16, min: "0", max: "65,535", hmax: "0xFFFF" },
    { name: "int16_t", bits: 16, min: "-32,768", max: "32,767", hmax: "0x7FFF" },
    { name: "uint32_t", bits: 32, min: "0", max: "4,294,967,295", hmax: "0xFFFF FFFF" },
    { name: "int32_t", bits: 32, min: "-2,147,483,648", max: "2,147,483,647", hmax: "0x7FFF FFFF" },
    { name: "uint64_t", bits: 64, min: "0", max: "18,446,744,073,709,551,615", hmax: "0xFFFF FFFF FFFF FFFF" },
    { name: "int64_t", bits: 64, min: "-9,223,372,036,854,775,808", max: "9,223,372,036,854,775,807", hmax: "0x7FFF FFFF FFFF FFFF" }
  ];
  const $body = $("#limits-table-body");
  const render = () => {
    $body.empty();
    types2.forEach((t) => {
      const isSigned = t.name.startsWith("i");
      const nameColor = isSigned ? "text-amber-400" : "text-blue-400";
      const row = `
        <tr class="hover:bg-white/5 transition-colors group cursor-copy" data-copy-max="${t.max.replace(/,/g, "")}">
           <td class="px-6 py-4 font-bold ${nameColor}">${t.name}</td>
           <td class="px-6 py-4 text-gray-500">${t.bits}</td>
           <td class="px-6 py-4 text-gray-300">${t.min}</td>
           <td class="px-6 py-4 text-gray-100">${t.max}</td>
           <td class="px-6 py-4 text-right text-emerald-400 font-bold opacity-80 group-hover:opacity-100">${t.hmax}</td>
        </tr>
      `;
      $body.append(row);
    });
  };
  $body.on("click", "tr", function() {
    window.copyToClipboard($(this).data("copy-max"), $(this));
  });
  render();
});

// src/js/tools/resistor.js
$(document).ready(function() {
  const colors = [
    { name: "Black", hex: "#000000", val: 0, mult: 1, tol: null, ppm: null },
    { name: "Brown", hex: "#8B4513", val: 1, mult: 10, tol: 1, ppm: 100 },
    { name: "Red", hex: "#FF0000", val: 2, mult: 100, tol: 2, ppm: 50 },
    { name: "Orange", hex: "#FFA500", val: 3, mult: 1e3, tol: null, ppm: 15 },
    { name: "Yellow", hex: "#FFFF00", val: 4, mult: 1e4, tol: null, ppm: 25 },
    { name: "Green", hex: "#008000", val: 5, mult: 1e5, tol: 0.5, ppm: null },
    { name: "Blue", hex: "#0000FF", val: 6, mult: 1e6, tol: 0.25, ppm: 10 },
    { name: "Violet", hex: "#EE82EE", val: 7, mult: 1e7, tol: 0.1, ppm: 5 },
    { name: "Grey", hex: "#808080", val: 8, mult: 1e8, tol: 0.05, ppm: null },
    { name: "White", hex: "#FFFFFF", val: 9, mult: 1e9, tol: null, ppm: 1 },
    { name: "Gold", hex: "#FFD700", val: null, mult: 0.1, tol: 5, ppm: null },
    { name: "Silver", hex: "#C0C0C0", val: null, mult: 0.01, tol: 10, ppm: null }
  ];
  let currentBands = 4;
  const selections = [1, 0, 0, 2, 10, 1];
  const $selectors = $("#resistor-selectors");
  const $vizRef = $("#resistor-quick-ref");
  const $outVal = $("#resistor-out-value");
  const $outMeta = $("#resistor-out-meta");
  const init = () => {
    $vizRef.empty();
    colors.forEach((c) => {
      $vizRef.append(`<div class="w-full aspect-square rounded shadow-inner" style="background-color: ${c.hex}" title="${c.name}"></div>`);
    });
    renderSelectors();
    calculate();
  };
  const renderSelectors = () => {
    $selectors.empty();
    const bandLabels = currentBands === 4 ? ["1st Digit", "2nd Digit", "Multiplier", "Tolerance"] : currentBands === 5 ? ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance"] : ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance", "Temp Coeff"];
    bandLabels.forEach((label, i) => {
      const actualIdx = i === 2 && currentBands === 4 ? 3 : i === 3 && currentBands === 4 ? 4 : i;
      const selectHtml = `
        <div class="flex items-center justify-between gap-4">
           <span class="text-[10px] font-bold text-gray-600 uppercase w-20">${label}</span>
           <select class="band-select flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none" data-band="${actualIdx}">
              ${colors.map((c, ci) => {
        const disabled = i < currentBands - 2 && c.val === null ? "disabled" : "";
        const selected = ci === selections[actualIdx] ? "selected" : "";
        return `<option value="${ci}" ${disabled} ${selected}>${c.name}</option>`;
      }).join("")}
           </select>
        </div>
      `;
      $selectors.append(selectHtml);
    });
  };
  const calculate = () => {
    let val = 0;
    let tol = 0;
    let ppm = null;
    let multiplier = 1;
    if (currentBands === 4) {
      val = colors[selections[0]].val * 10 + colors[selections[1]].val;
      multiplier = colors[selections[3]].mult;
      tol = colors[selections[4]].tol;
    } else {
      val = colors[selections[0]].val * 100 + colors[selections[1]].val * 10 + colors[selections[2]].val;
      multiplier = colors[selections[3]].mult;
      tol = colors[selections[4]].tol;
      if (currentBands === 6) ppm = colors[selections[5]].ppm;
    }
    const resistance = val * multiplier;
    let formatted = "";
    if (resistance >= 1e6) formatted = (resistance / 1e6).toFixed(resistance % 1e6 === 0 ? 0 : 1) + "M \u03A9";
    else if (resistance >= 1e3) formatted = (resistance / 1e3).toFixed(resistance % 1e3 === 0 ? 0 : 1) + "k \u03A9";
    else formatted = resistance.toFixed(resistance % 1 === 0 ? 0 : 2) + " \u03A9";
    $outVal.text(formatted);
    $outMeta.text(`\xB1${tol}%` + (ppm ? ` \u2022 ${ppm}ppm/K` : ""));
    $(".resistor-band").each(function() {
      const bIdx = $(this).data("band");
      $(this).css("background-color", colors[selections[bIdx]].hex);
    });
    $("#band-3-visual").toggleClass("hidden", currentBands === 4);
    $("#band-6-visual").toggleClass("hidden", currentBands !== 6);
  };
  $selectors.on("change", ".band-select", function() {
    selections[$(this).data("band")] = parseInt($(this).val());
    calculate();
  });
  $(".resistor-mode-btn").on("click", function() {
    $(".resistor-mode-btn").removeClass("bg-blue-600 text-white").addClass("text-gray-400 hover:text-gray-200");
    $(this).addClass("bg-blue-600 text-white").removeClass("text-gray-400 hover:text-gray-200");
    currentBands = parseInt($(this).data("bands"));
    renderSelectors();
    calculate();
  });
  init();
});

// src/js/tools/divider.js
$(document).ready(function() {
  const $vin = $("#div-vin"), $r1 = $("#div-r1"), $r2 = $("#div-r2"), $vout = $("#div-vout");
  const calcDivider = (target) => {
    const vin = parseFloat($vin.val()), r1 = parseFloat($r1.val()), r2 = parseFloat($r2.val()), vout = parseFloat($vout.val());
    if (target === "vout") {
      const result = vin * (r2 / (r1 + r2));
      $vout.val(result.toFixed(3));
    } else if (target === "r2") {
      const result = vout * r1 / (vin - vout);
      $r2.val(result.toFixed(1));
    } else if (target === "r1") {
      const result = r2 * (vin - vout) / vout;
      $r1.val(result.toFixed(1));
    } else if (target === "vin") {
      const result = vout * (r1 + r2) / r2;
      $vin.val(result.toFixed(3));
    }
  };
  $vin.on("input", () => calcDivider("vout"));
  $r1.on("input", () => calcDivider("vout"));
  $r2.on("input", () => calcDivider("vout"));
  $vout.on("input", () => calcDivider("r2"));
  const $v = $("#ohm-v"), $i = $("#ohm-i"), $r = $("#ohm-r"), $pOut = $("#ohm-p-out");
  const calcOhm = (target) => {
    const v = parseFloat($v.val()), i = parseFloat($i.val()), r = parseFloat($r.val());
    if (target === "v") {
      $v.val((i * r).toFixed(3));
    } else if (target === "i") {
      $i.val((v / r).toFixed(4));
    } else if (target === "r") {
      $r.val((v / i).toFixed(1));
    }
    const p = parseFloat($v.val()) * parseFloat($i.val());
    let pFormatted = "";
    if (p >= 1) pFormatted = p.toFixed(2) + '<small class="text-xs font-normal text-gray-500 ml-1">W</small>';
    else pFormatted = (p * 1e3).toFixed(1) + '<small class="text-xs font-normal text-gray-500 ml-1">mW</small>';
    $pOut.html(pFormatted);
  };
  $v.on("input", () => calcOhm("i"));
  $i.on("input", () => calcOhm("v"));
  $r.on("input", () => calcOhm("v"));
  calcDivider("vout");
  calcOhm("i");
});

// src/js/tools/baud.js
$(document).ready(function() {
  const commonBauds = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];
  const $clock = $("#baud-clock");
  const $preset = $("#baud-preset");
  const $tableBody = $("#baud-table-body");
  let currentOS = 16;
  const calculate = () => {
    const clock = parseFloat($clock.val());
    if (isNaN(clock) || clock <= 0) return;
    $tableBody.empty();
    commonBauds.forEach((target) => {
      const idealDivider = clock / (currentOS * target);
      const actualDivider = Math.round(idealDivider);
      if (actualDivider <= 0) {
        $tableBody.append(`<tr><td class="px-6 py-4 text-emerald-400 font-bold">${target}</td><td colspan="4" class="px-6 py-4 text-gray-700 italic">Clock too slow</td></tr>`);
        return;
      }
      const actualBaud = clock / (currentOS * actualDivider);
      const error = (actualBaud - target) / target * 100;
      const errorClass = Math.abs(error) > 2 ? "text-rose-400 font-bold" : Math.abs(error) > 1 ? "text-amber-400" : "text-emerald-400";
      const row = `
        <tr class="hover:bg-white/5 transition-colors">
           <td class="px-6 py-4 text-emerald-400 font-bold">${target.toLocaleString()}</td>
           <td class="px-6 py-4 text-gray-500">${idealDivider.toFixed(3)}</td>
           <td class="px-6 py-4 text-gray-300 font-bold">${actualDivider}</td>
           <td class="px-6 py-4 text-gray-400">${Math.round(actualBaud).toLocaleString()}</td>
           <td class="px-6 py-4 text-right ${errorClass}">${error.toFixed(2)}%</td>
        </tr>
      `;
      $tableBody.append(row);
    });
  };
  $clock.on("input", calculate);
  $preset.on("change", function() {
    const val = $(this).val();
    if (val !== "custom") {
      $clock.val(val);
      calculate();
    }
  });
  $(".baud-os-btn").on("click", function() {
    $(".baud-os-btn").removeClass("bg-blue-600 text-white").addClass("text-gray-500 hover:text-gray-300");
    $(this).addClass("bg-blue-600 text-white").removeClass("text-gray-500 hover:text-gray-300");
    currentOS = parseInt($(this).data("os"));
    calculate();
  });
  calculate();
});

// src/js/tools/qformat.js
$(document).ready(function() {
  const $m = $("#q-bits-int"), $n = $("#q-bits-frac");
  const $inFloat = $("#q-input-float"), $inFixed = $("#q-input-fixed");
  const $min = $("#q-info-min"), $max = $("#q-info-max"), $res = $("#q-info-res"), $total = $("#q-info-total");
  const updateInfo = () => {
    const m = parseInt($m.val()), n = parseInt($n.val());
    const total = m + n + 1;
    $total.text(`${total} Bits (incl. sign)`);
    $res.text((1 / Math.pow(2, n)).toExponential(4));
    const maxVal = (Math.pow(2, m + n) - 1) / Math.pow(2, n);
    const minVal = -Math.pow(2, m);
    $max.text(maxVal.toFixed(n > 5 ? 5 : n));
    $min.text(minVal.toFixed(n > 5 ? 5 : n));
  };
  const toFixed = () => {
    const n = parseInt($n.val());
    const fVal = parseFloat($inFloat.val());
    if (isNaN(fVal)) return;
    const shifted = BigInt(Math.round(fVal * Math.pow(2, n)));
    $inFixed.val("0x" + shifted.toString(16).toUpperCase());
  };
  const toFloat = () => {
    const n = parseInt($n.val());
    let raw = $inFixed.val().trim();
    if (!raw.startsWith("0x")) raw = "0x" + raw;
    try {
      const fixed = BigInt(raw);
      const result = Number(fixed) / Math.pow(2, n);
      $inFloat.val(result.toFixed(n > 10 ? 10 : n));
    } catch (e) {
    }
  };
  $m.on("input", () => {
    updateInfo();
    toFixed();
  });
  $n.on("input", () => {
    updateInfo();
    toFixed();
  });
  $inFloat.on("input", toFixed);
  $inFixed.on("input", toFloat);
  updateInfo();
  toFixed();
});

// src/js/tools/cobs.js
$(document).ready(function() {
  const $input = $("#cobs-input");
  const $output = $("#cobs-output");
  const hexToBytes = (hex) => {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length === 0) return [];
    const bytes = [];
    for (let i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.substring(i, i + 2), 16));
    }
    return bytes;
  };
  const bytesToHex = (bytes) => {
    return Array.from(bytes).map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
  };
  const encode = (data) => {
    let result = [];
    let readIndex = 0;
    let writeIndex = 0;
    let codeIndex = 0;
    let code = 1;
    result.push(0);
    while (readIndex < data.length) {
      if (data[readIndex] === 0) {
        result[codeIndex] = code;
        codeIndex = result.length;
        result.push(0);
        code = 1;
      } else {
        result.push(data[readIndex]);
        code++;
        if (code === 255) {
          result[codeIndex] = code;
          codeIndex = result.length;
          result.push(0);
          code = 1;
        }
      }
      readIndex++;
    }
    result[codeIndex] = code;
    result.push(0);
    return result;
  };
  const decode = (data) => {
    let result = [];
    let readIndex = 0;
    while (readIndex < data.length) {
      let code = data[readIndex];
      if (code === 0) break;
      readIndex++;
      for (let i = 1; i < code; i++) {
        result.push(data[readIndex++]);
      }
      if (code < 255 && readIndex < data.length && data[readIndex] !== 0) {
        result.push(0);
      }
    }
    return result;
  };
  $("#cobs-encode-btn").on("click", () => {
    const bytes = hexToBytes($input.val());
    if (bytes.length === 0) return;
    $output.val(bytesToHex(encode(bytes)));
  });
  $("#cobs-decode-btn").on("click", () => {
    const bytes = hexToBytes($output.val());
    if (bytes.length === 0) return;
    $input.val(bytesToHex(decode(bytes)));
  });
});

// src/js/tools/protocols.js
$(document).ready(function() {
  const protocols = [
    {
      name: "I2C (Inter-Integrated Circuit)",
      lines: ["SDA (Data)", "SCL (Clock)", "GND", "VCC"],
      desc: "Synchronous, multi-master, multi-slave, packet switched, single-ended, serial communication bus.",
      speed: "100kbps (Std), 400kbps (Fast), 3.4Mbps (High)",
      color: "blue"
    },
    {
      name: "SPI (Serial Peripheral Interface)",
      lines: ["MOSI (Master Out)", "MISO (Master In)", "SCK (Clock)", "SS/CS (Select)"],
      desc: "Full duplex synchronous serial communication interface used for short distance communication.",
      speed: "Commonly 1MHz to 100MHz+",
      color: "emerald"
    },
    {
      name: "UART (Universal Asynchronous)",
      lines: ["TX (Transmit)", "RX (Receive)", "GND"],
      desc: "Asynchronous serial communication in which the data format and transmission speeds are configurable.",
      speed: "Commonly 9600 to 115200 (up to 4Mbps+)",
      color: "amber"
    },
    {
      name: "JTAG (Joint Test Action Group)",
      lines: ["TMS", "TCK", "TDI", "TDO", "TRST (optional)"],
      desc: "Standard for verifying designs and testing printed circuit boards after manufacture.",
      speed: "Depends on debugger (100kHz to 50MHz)",
      color: "rose"
    },
    {
      name: "SWD (Serial Wire Debug)",
      lines: ["SWDIO (Data I/O)", "SWCLK (Clock)", "GND"],
      desc: "Alternative to JTAG for ARM processors, using fewer pins.",
      speed: "Up to 50MHz+",
      color: "violet"
    },
    {
      name: "CAN Bus (Controller Area Network)",
      lines: ["CAN High", "CAN Low", "GND (Optional)"],
      desc: "Robust vehicle bus standard optimized for microcontrollers to communicate without a host computer.",
      speed: "Up to 1Mbps (CAN), 5Mbps+ (CAN-FD)",
      color: "indigo"
    }
  ];
  const $grid = $("#prot-grid");
  const $search = $("#prot-search");
  const render = (query = "") => {
    $grid.empty();
    const q = query.toLowerCase();
    const filtered = protocols.filter(
      (p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.lines.some((l) => l.toLowerCase().includes(q))
    );
    filtered.forEach((p) => {
      const card = `
        <div class="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm hover:border-${p.color}-500/30 transition-all shadow-lg group">
           <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-${p.color}-500/10 flex items-center justify-center border border-${p.color}-500/20">
                 <span class="text-${p.color}-400 font-bold text-xs">${p.name.substring(0, 1)}</span>
              </div>
              <h4 class="text-sm font-bold text-gray-100">${p.name}</h4>
           </div>
           
           <div class="space-y-3">
              <div>
                 <span class="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Pinout / Lines</span>
                 <div class="flex flex-wrap gap-1">
                    ${p.lines.map((l) => `<span class="px-2 py-0.5 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-400 font-mono">${l}</span>`).join("")}
                 </div>
              </div>
              <div>
                 <span class="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Description</span>
                 <p class="text-[10px] text-gray-500 leading-relaxed">${p.desc}</p>
              </div>
              <div class="pt-2 border-t border-gray-700/30 flex justify-between items-center">
                 <span class="text-[9px] font-bold text-${p.color}-400/70 uppercase">Max Speed</span>
                 <span class="text-[9px] text-gray-400 font-mono">${p.speed}</span>
              </div>
           </div>
        </div>
      `;
      $grid.append(card);
    });
  };
  $search.on("input", function() {
    render($(this).val());
  });
  render();
});

// src/js/sidebar-logic.js
function initSidebar() {
  const searchInput = document.getElementById("sidebar-search");
  const categoryGroups = document.querySelectorAll(".category-group");
  const navLinks = document.querySelectorAll(".nav-link");
  loadSidebarState();
  categoryGroups.forEach((group) => {
    const header = group.querySelector(".category-header");
    header.addEventListener("click", () => {
      const isExpanded = group.classList.toggle("expanded");
      const categoryId = group.getAttribute("data-category");
      saveSidebarState(categoryId, isExpanded);
    });
  });
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterSidebar(query);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
  function loadSidebarState() {
    const savedState = JSON.parse(localStorage.getItem("bit-twiddler-sidebar-state") || "{}");
    categoryGroups.forEach((group) => {
      const categoryId = group.getAttribute("data-category");
      const shouldExpand = savedState[categoryId] !== false;
      if (shouldExpand) {
        group.classList.add("expanded");
      } else {
        group.classList.remove("expanded");
      }
    });
  }
  function saveSidebarState(categoryId, isExpanded) {
    const savedState = JSON.parse(localStorage.getItem("bit-twiddler-sidebar-state") || "{}");
    savedState[categoryId] = isExpanded;
    localStorage.setItem("bit-twiddler-sidebar-state", JSON.stringify(savedState));
  }
  function filterSidebar(query) {
    if (!query) {
      categoryGroups.forEach((group) => {
        group.classList.remove("hidden");
        loadSidebarState();
      });
      navLinks.forEach((link) => {
        link.closest("li").classList.remove("hidden");
      });
      return;
    }
    categoryGroups.forEach((group) => {
      const linksInGroup = group.querySelectorAll(".nav-link");
      let groupHasMatch = false;
      linksInGroup.forEach((link) => {
        const text = link.innerText.toLowerCase();
        const li = link.closest("li");
        if (text.includes(query)) {
          li.classList.remove("hidden");
          groupHasMatch = true;
        } else {
          li.classList.add("hidden");
        }
      });
      if (groupHasMatch) {
        group.classList.remove("hidden");
        group.classList.add("expanded");
      } else {
        group.classList.add("hidden");
      }
    });
  }
}

// src/renderer.js
window.copyToClipboard = copyToClipboard2;
window.escHtml = escHtml2;
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
});
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
