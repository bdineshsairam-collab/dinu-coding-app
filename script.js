const title = document.getElementById('topic-title');
const description = document.getElementById('topic-description');
const list = document.getElementById('topic-list');
const challengeTitle = document.getElementById('challenge-title');
const challengeText = document.getElementById('challenge-text');
const codeInput = document.getElementById('code-input');
const feedback = document.getElementById('feedback');
const runButton = document.getElementById('run-code');
const blockWorkspace = document.getElementById('block-workspace');
const dropZone = document.getElementById('drop-zone');
const blocks = document.querySelectorAll('.block');
const cards = document.querySelectorAll('.category-card');

const content = {
  python: {
    title: 'Python',
    description:
      'Python is a beginner-friendly language that helps you learn logic, problem solving, and app building step by step.',
    items: [
      'Learn variables and conditions',
      'Build small scripts and games',
      'Create projects with confidence',
    ],
    challengeTitle: 'Try a Python challenge',
    challengeText: 'Write a tiny program that prints a greeting.',
    starterCode: 'print("Hello, Python!")',
    placeholder: 'Type Python code here',
    hint: 'Try adding a print statement such as print("Hello")',
    successText: 'Nice work! Your Python code is ready to run.',
    check(code) {
      const normalized = code.toLowerCase().trim();
      const acceptedPatterns = ['print(', 'input(', 'def ', 'name =', 'for ', 'if ', 'while '];
      return normalized.length > 0 && acceptedPatterns.some((pattern) => normalized.includes(pattern));
    },
  },
  block: {
    title: 'Block Coding',
    description:
      'Block coding uses visual blocks to teach programming concepts without worrying about syntax.',
    items: [
      'Arrange blocks to make simple programs',
      'Explore loops, events, and logic',
      'Create animations and interactive stories',
    ],
    challengeTitle: 'Try a block coding challenge',
    challengeText: 'Build a simple program that says hello when it starts.',
    starterCode: 'When start\nSay "Hello, world!"',
    placeholder: 'Describe your blocks here',
    hint: 'Try using words like When start and Say hello.',
    successText: 'Great job! Your block idea is clear and ready to build.',
    check(code) {
      const normalized = code.toLowerCase();
      return normalized.includes('when') && (normalized.includes('say') || normalized.includes('move') || normalized.includes('repeat'));
    },
  },
};

function getCurrentCategory() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('block')) {
    return 'block';
  }
  return 'python';
}

function updatePanel(category) {
  const selected = content[category];
  if (!title || !description || !list || !challengeTitle || !challengeText) {
    return;
  }

  title.textContent = selected.title;
  description.textContent = selected.description;
  list.innerHTML = selected.items.map((item) => `<li>${item}</li>`).join('');
  challengeTitle.textContent = selected.challengeTitle;
  challengeText.textContent = selected.challengeText;
  if (codeInput) {
    codeInput.value = selected.starterCode;
    codeInput.placeholder = selected.placeholder;
  }
  if (feedback) {
    feedback.textContent = selected.hint;
    feedback.className = 'feedback';
  }

  if (blockWorkspace && codeInput) {
    if (category === 'block') {
      blockWorkspace.classList.remove('hidden');
      codeInput.style.display = 'none';
    } else {
      blockWorkspace.classList.add('hidden');
      codeInput.style.display = 'block';
    }
  }
}

if (cards.length) {
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((item) => item.classList.remove('active'));
      card.classList.add('active');
      updatePanel(card.dataset.category);
    });
  });
}

if (runButton && feedback && codeInput) {
  runButton.addEventListener('click', () => {
    const activeCategory = cards.length ? document.querySelector('.category-card.active').dataset.category : getCurrentCategory();
    const selected = content[activeCategory];
    const code = codeInput.value.trim();

    if (activeCategory === 'block') {
      const blockText = dropZone ? dropZone.innerText.replace('Drop blocks here to build your program', '').trim() : '';
      if (!blockText) {
        feedback.textContent = 'Drop at least one block first.';
        feedback.className = 'feedback';
        return;
      }

      if (selected.check(blockText)) {
        feedback.textContent = selected.successText;
        feedback.className = 'feedback success';
      } else {
        feedback.textContent = selected.hint;
        feedback.className = 'feedback';
      }
      return;
    }

    if (!code) {
      feedback.textContent = 'Write a few lines of code first.';
      feedback.className = 'feedback';
      return;
    }

    if (selected.check(code)) {
      feedback.textContent = selected.successText;
      feedback.className = 'feedback success';
    } else {
      feedback.textContent = selected.hint;
      feedback.className = 'feedback';
    }
  });
}

if (blocks.length && dropZone) {
  blocks.forEach((block) => {
    block.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', block.dataset.block);
    });
  });

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    const blockName = event.dataTransfer.getData('text/plain');
    const label = blockName.replace('-', ' ');
    const chip = document.createElement('span');
    chip.className = 'placed-block';
    chip.textContent = label;
    dropZone.appendChild(chip);
    if (feedback) {
      feedback.textContent = 'Block added! Click Check my code to test your plan.';
      feedback.className = 'feedback';
    }
  });
}

updatePanel(getCurrentCategory());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Ignore service worker registration errors in this simple demo
    });
  });
}

const installButton = document.getElementById('install-app');
let installPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventEvent();
  installPrompt = event;
  if (installButton) {
    installButton.hidden = false;
  }
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
}
