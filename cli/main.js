window.addEventListener("DOMContentLoaded", () => {
  const path = "~/" + currentPath.slice(1).join("/");

  // Welcome block
  const welcome = document.createElement("div");
  welcome.innerHTML = `
    <p><span class="prompt">prem@portfolio:${path}$</span></p>
    <p class="help-pre">Welcome to the Portfolio CLI!\n\nHi — I'm Prem, a Computer Engineering student building interactive web experiences.\nThis CLI-style portfolio lets you explore my work using familiar commands.</p>
    <p class="help-pre">Quick tips:\n  - <span class="cmd-name">ls</span> : list files and directories\n  - <span class="cmd-name">cd &lt;dir&gt;</span> : change directory\n  - <span class="cmd-name">cat &lt;file&gt;</span> : show file contents\n  - <span class="cmd-name">help</span> : show available commands\n\nTry <span class="cmd-name">ls</span> to get started!</p>
  `;
  outputArea.appendChild(welcome);
  input.focus();
});

const input = document.querySelector("#cli-input");
const outputArea = document.getElementById("cli-output-area");

// Virtual directory structure for portfolio
const portfolioFS = {
  home: {
    about: `Hi! I'm Prem, a Computer Engineering student passionate about building creative web experiences.
I specialize in front-end development and enjoy creating interactive user interfaces.
Currently pursuing B.Tech and constantly learning new technologies.`,
    education: `B.Tech in Computer Engineering
SVKM Institute of Technology, Dhule
Currently Pursuing

Diploma in Computer Engineering
Matoshree Asarabai Polytechnic, Nashik
Completed`,
    skills: `Languages: JavaScript, HTML, CSS, Python
Frameworks: React, Node.js, Express
Tools: Git, VS Code, Figma
Interests: Web Design, CLI Tools, Game Development`,
    projects: {
      project1: `Portfolio CLI - Interactive terminal-style portfolio
Tech: Vanilla JavaScript, CSS
A unique portfolio website designed as a command-line interface.`,
      project2: `Project Name 2 - Brief description
Tech: React, Node.js
Add your second project description here.`,
      project3: `Project Name 3 - Brief description  
Tech: Python, Flask
Add your third project description here.`,
    },
    contact: `Email: your.email@example.com
GitHub: github.com/yourusername
LinkedIn: linkedin.com/in/yourprofile
Twitter: @yourhandle

Feel free to reach out for collaborations or just to chat!`,
  },
};

let currentPath = ["home"];
let commandHistory = [];
let historyIndex = -1;

function getCurrentDir() {
  let dir = portfolioFS;
  for (const part of currentPath) {
    dir = dir[part];
  }
  return dir;
}

function lsCommand() {
  const dir = getCurrentDir();
  if (typeof dir === "string") {
    return `<span class="error">ls: not a directory</span>`;
  }
  const entries = Object.keys(dir);
  let result = "";

  entries.forEach((entry) => {
    const isDir = typeof dir[entry] === "object";
    const colorClass = isDir ? "dir-color" : "file-color";
    const suffix = isDir ? "/" : "";
    result += `<span class="${colorClass}">${entry}${suffix}</span>    `;
  });

  return result.trim();
}

function cdCommand(arg) {
  if (arg === "..") {
    if (currentPath.length > 1) {
      currentPath.pop();
      return "";
    } else {
      return `<span class="error">Already at root.</span>`;
    }
  }

  const dir = getCurrentDir();
  if (typeof dir === "string") {
    return `<span class="error">cd: not a directory</span>`;
  }

  if (dir[arg]) {
    if (typeof dir[arg] === "string") {
      return `<span class="error">cd: ${arg}: Not a directory</span>`;
    }
    currentPath.push(arg);
    return "";
  } else {
    return `<span class="error">cd: ${arg}: No such file or directory</span>`;
  }
}

function catCommand(file) {
  const dir = getCurrentDir();
  if (typeof dir === "string") {
    return `<span class="error">cat: cannot read from within a file</span>`;
  }
  if (dir[file]) {
    if (typeof dir[file] === "string") {
      // Return file contents wrapped and escaped so we can style them
      return `<pre class="file-content">${escapeHtml(dir[file])}</pre>`;
    } else {
      return `<span class="error">cat: ${file}: Is a directory</span>`;
    }
  } else {
    return `<span class="error">cat: ${file}: No such file or directory</span>`;
  }
}

function helpCommand() {
  return `<pre class="help-pre">Available commands:
  ls           List files and directories
  cd &lt;dir&gt;     Change directory (use 'cd ..' to go up)
  pwd          Print working directory
  cat &lt;file&gt;   Display file contents
  clear        Clear the terminal
  help         Show this help message
  whoami       Display user info

Try 'ls' to see what's available!</pre>`;
}

function getPrompt() {
  const path =
    currentPath.length === 1 ? "~" : "~/" + currentPath.slice(1).join("/");
  return `prem@portfolio:${path}$`;
}

function handleCommand(cmd) {
  const [command, ...args] = cmd.trim().split(/\s+/);
  let result = "";
  switch (command) {
    case "ls":
      result = lsCommand();
      break;
    case "cd":
      result = args.length ? cdCommand(args[0]) : "";
      break;
    case "pwd":
      const path =
        currentPath.length === 1 ? "~" : "~/" + currentPath.slice(1).join("/");
      result = path;
      break;
    case "cat":
      result = args.length
        ? catCommand(args[0])
        : `<span class="error">cat: missing operand</span>`;
      break;
    case "clear":
      outputArea.innerHTML = "";
      return "";
    case "help":
      result = helpCommand();
      break;
    case "whoami":
      result = "prem";
      break;
    case "":
      return "";
    default:
      result = `<span class="error">${command}: command not found</span>`;
  }
  return result;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const cmd = input.value;
    if (cmd.trim()) {
      commandHistory.push(cmd);
      historyIndex = commandHistory.length;
    }
    const output = document.createElement("p");
    const prompt = getPrompt();
    const result = handleCommand(cmd);

    // Colorize prompt, command name and args
    const parts = cmd.trim().split(/\s+/);
    const cmdName = parts[0] || "";
    const cmdArgs = parts.slice(1);
    const safeCmdName = escapeHtml(cmdName);
    const safeArgs = cmdArgs
      .map((a) => `<span class="cmd-arg">${escapeHtml(a)}</span>`)
      .join(" ");
    const coloredCmd = cmdName
      ? `<span class="cmd-name">${safeCmdName}</span>${
          safeArgs ? " " + safeArgs : ""
        }`
      : "";

    if (result !== "") {
      output.innerHTML = `<span class="prompt">${escapeHtml(prompt)}</span> ${
        coloredCmd ? coloredCmd : ""
      }\n${result}\n`;
      outputArea.appendChild(output);
    } else if (cmd.trim() !== "" && cmd.trim() !== "clear") {
      output.innerHTML = `<span class="prompt">${escapeHtml(prompt)}</span> ${
        coloredCmd ? coloredCmd : ""
      }\n`;
      outputArea.appendChild(output);
    }
    input.value = "";
    outputArea.scrollTop = outputArea.scrollHeight;
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      input.value = "";
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    const partial = input.value.trim();
    const parts = partial.split(/\s+/);
    const lastWord = parts[parts.length - 1];

    const dir = getCurrentDir();
    if (typeof dir !== "string") {
      const matches = Object.keys(dir).filter((key) =>
        key.startsWith(lastWord)
      );
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        input.value = parts.join(" ");
      } else if (matches.length > 1) {
        const output = document.createElement("p");
        output.innerHTML = `\n${matches.join("    ")}\n`;
        outputArea.appendChild(output);
        outputArea.scrollTop = outputArea.scrollHeight;
      }
    }
  }
});

// Update prompt dynamically
setInterval(() => {
  const label = document.querySelector('label[for="cli-input"]');
  if (label) {
    label.textContent = "›";
  }
}, 100);

// Keep input focused
document.addEventListener("click", () => {
  input.focus();
});
