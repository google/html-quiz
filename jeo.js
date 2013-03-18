/*
 * Quiz script.
 * Copyright 2013 Google Inc.
 * Author: Michal Nazarewicz <mina86@mina86.com>
 *
 * This is not a Google product.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

document.addEventListener('DOMContentLoaded', function() {
  /* Must be two. */
  var teams = ['Team 1', 'Team 2'];


  var NS = 'http://www.w3.org/1999/xhtml';
  var D = document;

  var categories = (function() {
    var ret = [], questions = null, question = null;
    var el = D.getElementById('questions').firstChild;
    for (; el !== null; el = el.nextSibling) {
      if (el.nodeType !== 1) {
        /* nop */
      } else if (el.nodeName.toLowerCase() === 'h2') {
        questions = [];
        question = null;
        ret.push({
          title: el.textContent,
          questions: questions,
        });
      } else if (questions === null) {
        /* nop */
      } else if (el.nodeName.toLowerCase() !== 'div') {
        /* nop */
      } else if (question === null) {
        el.className = 'q';
        question = el;
      } else {
        el.className = 'a';
        questions.push([question, el]);
        question = null;
      }
    }
    return ret;
  })();

  var scores = [];


  var nukeChildren = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };

  var addText = function(el, text) {
    el.appendChild(D.createTextNode(text));
  };

  var addNewElement = function(parent, el, opt_text) {
    var el = D.createElementNS(NS, el);
    parent.appendChild(el);
    if (opt_text) {
      addText(el, opt_text);
    }
    return el;
  };


  var makeClickHandler = (function() {
    var m = D.getElementById('m');
    var links = D.getElementById('links');

    var questionShown = false;
    var question, points, td;

    var close = function() {
      m.className = '';
      questionShown = false;
      question[0].parentNode.removeChild(question[0]);
      question[1].parentNode.removeChild(question[1]);
    };

    D.getElementById('c').onclick = close;

    D.getElementById('nt').onclick = function() {
      m.className += ' showAnswer';
    };

    (function() {
      var makeTeamClickHandler = function(team) {
        return function() {
          if (team !== -1) {
            scores[team][0] += points;
            nukeChildren(scores[team][1]);
            addText(scores[team][1], '' + scores[team][0]);
          }
          td.className = '';
          td.onclick = null;
          close();
        };
      };

      D.getElementById('t0').onclick = makeTeamClickHandler(0);
      D.getElementById('t1').onclick = makeTeamClickHandler(1);
      D.getElementById('cc').onclick = makeTeamClickHandler(-1);
    })();

    return function(_question, _points) {
      return function() {
        if (!questionShown) {
          question = _question;
          points = _points;
          td = this;

          links.parentNode.insertBefore(question[0], links);
          links.parentNode.insertBefore(question[1], links);
          m.className = 'show';
        }
      };
    };
  })();


  var makeScoreHandler = function(team) {
    return function() {
      var score = window.prompt('Enter new score:', scores[team][0]);
      if (score) {
        score = parseInt(score);
        scores[team][0] = score
        nukeChildren(scores[team][1]);
        addText(scores[team][1], '' + score);
      }
    }
  };


  (function() {
    var table = D.getElementById('t'), rowset, row, cell;

    rowset = addNewElement(table, 'thead');
    row = addNewElement(rowset, 'tr');
    row.className = 'title';

    cell = addNewElement(row, 'th');
    cell.setAttribute('colspan', '' + categories.length);

    var title = D.getElementsByTagNameNS(NS, 'title')[0];
    addNewElement(cell, 'h1', title.textContent);

    row = addNewElement(rowset, 'tr');
    row.className = 'categories';

    categories.forEach(function(cat) {
      cell = addNewElement(row, 'th', cat.title);
    });

    rowset = addNewElement(table, 'tbody');

    for (var i = 1; i <= 5; ++i) {
      row = addNewElement(rowset, 'tr');

      categories.forEach(function(cat) {
        cell = addNewElement(row, 'td');
        if (i <= cat.questions.length) {
          addText(cell, '' + (i * 100));
          cell.className = 'active';
          cell.onclick = makeClickHandler(cat.questions[i - 1], i * 100);
        } else {
          addText(cell, ' ');
        }
      });
    }

    rowset = addNewElement(table, 'tfoot');
    row = addNewElement(rowset, 'tr');

    var addScoreCell = function(team) {
      cell = addNewElement(row, 'td');

      var div = D.createElementNS(NS, 'div');
      cell.appendChild(div);
      div.appendChild(D.createTextNode(teams[team]));

      div = D.createElementNS(NS, 'div');
      cell.appendChild(div);
      div.appendChild(D.createTextNode('0'));
      div.onclick = makeScoreHandler(team);
      return div;
    };

    scores.push([0, addScoreCell(0)]);
    if (categories.length > 2) {
      cell = D.createElementNS(NS, 'td');
      cell.setAttribute('colspan', '' + categories.length - 2);
      row.appendChild(cell);
    }
    scores.push([0, addScoreCell(1)]);

    D.getElementById('t0').innerHTML = teams[0];
    D.getElementById('t1').innerHTML = teams[1];
  })();
});
