(() => {
  const intervalMs = 2600;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const korean = document.documentElement.lang.toLowerCase().startsWith("ko");
  const copy = korean
    ? { previous: "이전 화면", next: "다음 화면", pause: "일시정지", play: "재생", sequence: "화면 안내", step: "단계" }
    : { previous: "Previous screen", next: "Next screen", pause: "Pause", play: "Play", sequence: "Screen walkthrough", step: "Step" };

  document.querySelectorAll("[data-shot-sequence]").forEach((sequence) => {
    const frames = [...sequence.querySelectorAll(":scope > figure.device-shot")];
    if (frames.length < 2) return;

    const stage = document.createElement("div");
    stage.className = "shot-sequence__stage";
    stage.setAttribute("aria-label", copy.sequence);
    frames[0].before(stage);
    frames.forEach((frame) => stage.append(frame));

    const progress = document.createElement("div");
    progress.className = "shot-sequence__progress";
    progress.setAttribute("aria-hidden", "true");
    const progressBar = document.createElement("span");
    progressBar.className = "shot-sequence__progress-bar";
    progress.append(progressBar);

    const controls = document.createElement("div");
    controls.className = "shot-sequence__controls";
    const previous = controlButton("‹", copy.previous);
    const status = document.createElement("span");
    status.className = "shot-sequence__status";
    status.setAttribute("aria-live", "polite");
    const toggle = controlButton("", copy.pause);
    const next = controlButton("›", copy.next);
    controls.append(previous, status, toggle, next);

    const dots = document.createElement("div");
    dots.className = "shot-sequence__dots";
    const dotButtons = frames.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "shot-sequence__dot";
      dot.setAttribute("aria-label", `${copy.step} ${index + 1}`);
      dots.append(dot);
      return dot;
    });
    sequence.append(progress, controls, dots);
    sequence.classList.add("is-enhanced");

    let active = 0;
    let paused = reducedMotion.matches;
    let timer = 0;

    function show(index, announce = false) {
      active = (index + frames.length) % frames.length;
      frames.forEach((frame, frameIndex) => {
        const selected = frameIndex === active;
        frame.classList.toggle("is-active", selected);
        frame.setAttribute("aria-hidden", String(!selected));
      });
      dotButtons.forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === active)));
      status.textContent = `${active + 1} / ${frames.length}`;
      if (!announce) status.setAttribute("aria-live", "off");
      window.requestAnimationFrame(() => status.setAttribute("aria-live", "polite"));
      restartProgress();
    }

    function updateToggle() {
      toggle.textContent = paused ? `▶ ${copy.play}` : `Ⅱ ${copy.pause}`;
      toggle.setAttribute("aria-label", paused ? copy.play : copy.pause);
    }

    function stop() {
      window.clearInterval(timer);
      timer = 0;
      sequence.classList.remove("is-playing");
    }

    function start() {
      stop();
      if (!paused && !document.hidden) {
        timer = window.setInterval(() => show(active + 1), intervalMs);
        restartProgress();
      }
    }

    function restartProgress() {
      sequence.classList.remove("is-playing");
      void progressBar.offsetWidth;
      if (!paused && !document.hidden) sequence.classList.add("is-playing");
    }

    function select(index) {
      show(index, true);
      start();
    }

    previous.addEventListener("click", () => select(active - 1));
    next.addEventListener("click", () => select(active + 1));
    toggle.addEventListener("click", () => {
      paused = !paused;
      updateToggle();
      start();
    });
    dotButtons.forEach((dot, index) => dot.addEventListener("click", () => select(index)));
    sequence.addEventListener("focusin", stop);
    sequence.addEventListener("focusout", (event) => {
      if (!sequence.contains(event.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", start);
    reducedMotion.addEventListener("change", (event) => {
      paused = event.matches;
      updateToggle();
      start();
    });

    show(0);
    updateToggle();
    start();
  });

  function controlButton(text, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shot-sequence__button";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    return button;
  }
})();
