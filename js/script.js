document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const data = window.UPSCZoneData || {};

  // Shared mobile navigation and footer year.
  const toggle = $(".menu-toggle"), nav = $("#navLinks");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Toggle navigation");
      toggle.textContent = open ? "✕" : "☰";
    });
    $$("a", nav).forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }));
  }
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const getSaved = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
    catch (_) { return fallback; }
  };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  // Daily planner: saved locally.
  const plannerTasks = $("#plannerTasks");
  if (plannerTasks && Array.isArray(data.plannerTasks)) {
    const key = "upsc-zone-planner";
    let state = getSaved(key, {});
    const render = () => {
      plannerTasks.innerHTML = "";
      data.plannerTasks.forEach((task, i) => {
        const label = document.createElement("label");
        label.className = "app-task";
        const input = document.createElement("input");
        input.type = "checkbox"; input.checked = !!state[i];
        const span = document.createElement("span"); span.textContent = task;
        input.addEventListener("change", () => {
          state[i] = input.checked; save(key, state); updateStatus();
        });
        label.append(input, span); plannerTasks.append(label);
      });
      updateStatus();
    };
    const updateStatus = () => {
      const done = data.plannerTasks.filter((_, i) => state[i]).length;
      const status = $("#plannerStatus");
      if (status) status.textContent = `${done} of ${data.plannerTasks.length} tasks completed`;
    };
    $("#resetPlanner")?.addEventListener("click", () => { state = {}; save(key, state); render(); });
    render();
  }

  // Current affairs search and theme filter.
  const affairsGrid = $("#affairsGrid");
  if (affairsGrid && Array.isArray(data.affairs)) {
    const search = $("#affairsSearch"), filter = $("#affairsFilter"), count = $("#affairsCount");
    const render = () => {
      const q = (search.value || "").trim().toLowerCase(), f = filter.value;
      const rows = data.affairs.filter(x => (f === "all" || x.theme === f) &&
        [x.title,x.summary,x.tag,x.paper,x.question].join(" ").toLowerCase().includes(q));
      affairsGrid.innerHTML = rows.map(x => `<article class="app-news-card"><span class="app-tag">${esc(x.tag)} · ${esc(x.paper)}</span><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><details><summary>Study angle + answer prompt</summary><p><strong>Think about:</strong> ${esc(x.question)}</p><p><strong>Revision takeaway:</strong> ${esc(x.takeaway)}</p></details></article>`).join("") || '<p class="app-muted">No briefings match your search. Try another term or filter.</p>';
      count.textContent = `${rows.length} demo briefing${rows.length === 1 ? "" : "s"} · illustrative learning content, not live news`;
    };
    search.addEventListener("input", render); filter.addEventListener("change", render); render();
  }

  // World affairs cards.
  const worldGrid = $("#worldGrid");
  if (worldGrid && Array.isArray(data.world)) {
    worldGrid.innerHTML = data.world.map(x => `<article class="app-world-card"><span class="app-tag">${esc(x.tag)}</span><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><details><summary>Essay / Mains prompt</summary><p>${esc(x.prompt)}</p></details></article>`).join("");
  }

  // Quiz: next, previous, restart, feedback, score.
  const quizAnswers = $("#quizAnswers");
  if (quizAnswers && Array.isArray(data.questions)) {
    let index = 0, selections = {};
    const renderQuiz = () => {
      const q = data.questions[index], selected = selections[index];
      $("#quizTopic").textContent = q.topic;
      $("#quizCounter").textContent = `QUESTION ${index + 1} / ${data.questions.length}`;
      $("#quizQuestion").textContent = q.question;
      $("#quizProgressBar").style.width = `${((index + 1) / data.questions.length) * 100}%`;
      quizAnswers.innerHTML = "";
      Object.entries(q.answers).forEach(([letter, answer]) => {
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "app-answer";
        btn.innerHTML = `<span class="letter">${letter}</span><span>${esc(answer)}</span>`;
        if (selected) {
          btn.disabled = true;
          if (letter === q.correct) btn.classList.add("correct");
          else if (letter === selected && selected !== q.correct) btn.classList.add("incorrect");
        }
        btn.addEventListener("click", () => {
          if (selections[index]) return;
          selections[index] = letter;
          renderQuiz();
        });
        quizAnswers.append(btn);
      });
      const feedback = $("#quizFeedback");
      if (selected) {
        const good = selected === q.correct;
        feedback.className = `app-feedback ${good ? "good" : "bad"}`;
        feedback.textContent = `${good ? "Correct!" : `Not quite. Correct answer: ${q.correct}.`} ${q.explanation}`;
      } else {
        feedback.className = "app-feedback";
        feedback.textContent = "Choose one answer to see the explanation.";
      }
      const score = data.questions.reduce((n, item, i) => n + (selections[i] === item.correct ? 1 : 0), 0);
      $("#quizScore").textContent = `${score} / ${Object.keys(selections).length}`;
      $("#quizProgress").textContent = `Question ${index + 1} of ${data.questions.length}`;
      $("#prevQuestion").disabled = index === 0;
      $("#nextQuestion").textContent = index === data.questions.length - 1 ? "Finish / restart ↻" : "Next question →";
    };
    $("#prevQuestion").addEventListener("click", () => { if (index > 0) { index--; renderQuiz(); } });
    $("#nextQuestion").addEventListener("click", () => {
      if (index < data.questions.length - 1) { index++; renderQuiz(); }
      else { index = 0; selections = {}; renderQuiz(); }
    });
    $("#restartQuiz").addEventListener("click", () => { index = 0; selections = {}; renderQuiz(); });
    renderQuiz();
  }

  // Syllabus checklist and filters.
  const syllabusList = $("#syllabusList");
  if (syllabusList && Array.isArray(data.syllabus)) {
    const key = "upsc-zone-syllabus";
    let checked = getSaved(key, {});
    const search = $("#syllabusSearch"), stage = $("#syllabusStage"), status = $("#syllabusStatus");
    const render = () => {
      const q = (search.value || "").toLowerCase().trim(), s = stage.value;
      const rows = data.syllabus.filter(x => (s === "all" || x.stage === s || (s === "both" && x.stage === "both")) &&
        [x.title,x.subject,x.detail].join(" ").toLowerCase().includes(q));
      syllabusList.innerHTML = rows.map((x) => {
        const i = data.syllabus.indexOf(x);
        return `<label class="app-syllabus-item"><input type="checkbox" data-syllabus="${i}" ${checked[i] ? "checked" : ""}><span><strong>${esc(x.title)}</strong><p>${esc(x.subject)} · ${esc(x.detail)}</p></span><small class="app-syllabus-meta">${esc(x.stage)}</small></label>`;
      }).join("") || '<p class="app-muted">No topics match. Try a different search.</p>';
      $$("[data-syllabus]", syllabusList).forEach(input => input.addEventListener("change", () => {
        checked[input.dataset.syllabus] = input.checked; save(key, checked); updateStatus();
      }));
      updateStatus();
    };
    const updateStatus = () => {
      const done = data.syllabus.filter((_, i) => checked[i]).length;
      status.textContent = `${done} of ${data.syllabus.length} checklist topics completed. Progress is saved in this browser.`;
    };
    search.addEventListener("input", render); stage.addEventListener("change", render);
    $("#markAllSyllabus").addEventListener("click", () => { checked = Object.fromEntries(data.syllabus.map((_,i)=>[i,true])); save(key,checked); render(); });
    $("#clearSyllabus").addEventListener("click", () => { checked = {}; save(key,checked); render(); });
    render();
  }

  // PYQ-style practice list: filtering and expandable answers.
  const pyqList = $("#pyqList");
  if (pyqList && Array.isArray(data.pyq)) {
    const search = $("#pyqSearch"), subject = $("#pyqSubject");
    const render = () => {
      const q = search.value.trim().toLowerCase(), s = subject.value;
      const rows = data.pyq.filter(x => (s === "all" || x.subject === s) && (x.question + " " + x.subject + " " + x.explanation).toLowerCase().includes(q));
      pyqList.innerHTML = rows.map((x, i) => `<article class="app-pyq-item"><span class="app-tag">${esc(x.subject)} · Illustrative question</span><h3>${esc(x.question)}</h3><ol type="A">${x.answers.map(a=>`<li>${esc(a)}</li>`).join("")}</ol><details><summary>Reveal answer and explanation</summary><p><strong>Answer:</strong> ${esc(x.answers[x.correct])}</p><p>${esc(x.explanation)}</p></details></article>`).join("") || '<p class="app-muted">No questions match your filters.</p>';
    };
    search.addEventListener("input", render); subject.addEventListener("change", render); render();
  }

  // Subject topic checklist.
  $$("[data-topic-list]").forEach(list => {
    const slug = list.dataset.topicList, key = `upsc-zone-topics-${slug}`;
    let state = getSaved(key, {});
    const boxes = $$("input[data-topic]", list);
    boxes.forEach(box => {
      box.checked = !!state[box.dataset.topic];
      box.addEventListener("change", () => { state[box.dataset.topic] = box.checked; save(key, state); });
    });
    $(`[data-complete-topics="${slug}"]`)?.addEventListener("click", () => {
      boxes.forEach(box => { box.checked = true; state[box.dataset.topic] = true; }); save(key,state);
    });
    $(`[data-clear-topics="${slug}"]`)?.addEventListener("click", () => {
      boxes.forEach(box => { box.checked = false; state[box.dataset.topic] = false; }); save(key,state);
    });
  });


  // Homepage's original sample quiz remains supported.
  const legacyList = $("#answerList"), legacyFeedback = $("#quizFeedback");
  const legacyQ = data.sampleQuestion;
  if (legacyList && legacyQ) {
    const qText = $("#questionText");
    if (qText) qText.textContent = legacyQ.question;
    const resetLegacy = () => {
      $$("[data-answer]", legacyList).forEach(btn => {
        const key = btn.dataset.answer;
        btn.disabled = false;
        btn.classList.remove("correct", "incorrect");
        btn.innerHTML = `<span>${key}</span> ${esc(legacyQ.answers[key])}`;
      });
      if (legacyFeedback) {
        legacyFeedback.className = "quiz-feedback";
        legacyFeedback.textContent = "Choose an answer to reveal the explanation.";
      }
    };
    $$("[data-answer]", legacyList).forEach(btn => btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const selected = btn.dataset.answer;
      $$("[data-answer]", legacyList).forEach(option => {
        option.disabled = true;
        if (option.dataset.answer === legacyQ.correct) option.classList.add("correct");
      });
      if (selected !== legacyQ.correct) btn.classList.add("incorrect");
      if (legacyFeedback) {
        const good = selected === legacyQ.correct;
        legacyFeedback.className = `quiz-feedback ${good ? "good" : "bad"}`;
        legacyFeedback.textContent = `${good ? "Correct!" : "Not quite."} ${legacyQ.explanation}`;
      }
    }));
    $("#resetQuiz")?.addEventListener("click", resetLegacy);
    resetLegacy();
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
});
