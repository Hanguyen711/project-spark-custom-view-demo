const models = [
  {
    id: "alpha",
    name: "model-alpha / reasoning-large",
    runtime: "20s",
    status: "Fail",
    answer:
      "The customer missed the cancellation deadline, so the renewal should usually stand. The agent can restate the policy and cancel future renewals, but a refund is not guaranteed.",
  },
  {
    id: "beta",
    name: "model-beta / balanced-pro",
    runtime: "13s",
    status: "Pass",
    answer:
      "A strong support response should acknowledge the frustration, confirm that future renewals can be cancelled immediately, and offer to review whether the recent renewal qualifies for a refund or exception under policy.",
  },
  {
    id: "gamma",
    name: "model-gamma / concise",
    runtime: "14s",
    status: "Pass",
    answer:
      "The agent should be empathetic, cancel future billing, and explain that the current charge can be reviewed. The response should avoid saying a refund is impossible unless that has been confirmed.",
  },
];

const failureTags = [
  "Policy Overstatement",
  "Incomplete Resolution",
  "Poor Communication",
];

let activeModelId = models[0].id;
let selectedModelIds = new Set([models[0].id, models[1].id]);
let runCount = 14;
const notes = {};

function currentModel() {
  return models.find((model) => model.id === activeModelId) || models[0];
}

function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";

  models.forEach((model, index) => {
    const tab = document.createElement("button");
    tab.className = `tab ${model.id === activeModelId ? "active" : ""}`;
    tab.onclick = () => {
      activeModelId = model.id;
      render();
    };

    const top = document.createElement("div");
    top.className = "tab-top";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedModelIds.has(model.id);
    checkbox.onclick = (event) => event.stopPropagation();
    checkbox.onchange = () => {
      if (selectedModelIds.has(model.id)) selectedModelIds.delete(model.id);
      else selectedModelIds.add(model.id);
      render();
    };

    const title = document.createElement("strong");
    title.textContent = model.name;

    top.append(checkbox, title);

    const subtitle = document.createElement("div");
    subtitle.className = "tab-subtitle";
    subtitle.textContent = `${model.status} · Model ${index + 1} · ${model.runtime}`;

    tab.append(top, subtitle);
    tabs.appendChild(tab);
  });
}

function renderPanel() {
  const model = currentModel();
  const panel = document.getElementById("modelPanel");
  const isFail = model.status === "Fail";
  const note = notes[model.id] || "";

  panel.innerHTML = `
    <div class="model-header">
      <div>
        <h2>${model.name}</h2>
        <div class="header-pills">
          <span class="pill ${isFail ? "warning" : ""}">${model.status}</span>
          <span class="muted">Model ${models.indexOf(model) + 1} · ${model.runtime}</span>
        </div>
      </div>
      <span class="muted">latest run</span>
    </div>
    <div class="model-body">
      <div class="section-label">Prompt</div>
      <div class="prompt-box">A customer says their annual subscription renewed, but they meant to cancel yesterday. What should the support agent say?</div>

      <div class="section-label" style="margin-top: 16px;">Final Answer</div>
      <div class="answer-box">${model.answer}</div>

      <div class="annotation">
        <div class="annotation-toggle">
          <div class="section-label">Annotation</div>
          <div class="segmented">
            <button data-status="Pass" class="${!isFail ? "active" : ""}">Pass</button>
            <button data-status="Fail" class="${isFail ? "active" : ""}">Fail</button>
          </div>
        </div>
        ${
          isFail
            ? `<div class="small muted">Failure tags</div>
               <div class="tag-row">${failureTags
                 .map((tag) => `<span class="pill">${tag}</span>`)
                 .join("")}</div>`
            : ""
        }
        <textarea id="annotationText" placeholder="${
          isFail
            ? "A brief explanation explaining how this response fails and how severe the failure is."
            : "A brief explanation (2-3 sentences) of why this response is strong and how it compares favorably to the source response."
        }">${note}</textarea>
        <p class="hint">${isFail ? "Minimum 200 characters." : "Minimum 150 characters."}</p>
      </div>
    </div>
  `;

  panel.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      model.status = button.getAttribute("data-status");
      render();
    });
  });

  panel.querySelector("#annotationText").addEventListener("input", (event) => {
    notes[model.id] = event.target.value;
  });
}

function renderButtons() {
  document.getElementById("rerunSelected").textContent =
    `Re-test selected (${selectedModelIds.size})`;
}

function render() {
  renderTabs();
  renderPanel();
  renderButtons();
}

document.getElementById("rerunAll").addEventListener("click", () => {
  runCount += models.length;
  alert(`Mock: queued ${models.length} model runs`);
});

document.getElementById("rerunSelected").addEventListener("click", () => {
  if (selectedModelIds.size === 0) {
    alert("Select at least one model to re-test");
    return;
  }
  runCount += selectedModelIds.size;
  alert(`Mock: queued ${selectedModelIds.size} selected model run(s)`);
});

render();
