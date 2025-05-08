document.addEventListener('DOMContentLoaded', function() {
  const introScreen = document.querySelector('.intro-screen');
  const formScreen = document.querySelector('.form-screen');
  const successScreen = document.querySelector('.success-screen');
  const startBtn = document.getElementById('start-btn');
  const form = document.getElementById('survey-form');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const restartBtn = document.getElementById('restart-btn');
  const questionCounter = document.querySelector('.question-counter');

  const questions = [
    { 
      question: 'What is your name?', 
      type: 'text', 
      name: 'name',
      required: true,
      error: 'Please enter your name'
    },
    { 
      question: 'What is your email?', 
      type: 'email', 
      name: 'email',
      required: true,
      error: 'Please enter a valid email'
    },
    { 
      question: 'Select your gender:', 
      type: 'radio', 
      name: 'gender', 
      options: ['Male', 'Female', 'Other'],
      required: true,
      error: 'Please select your gender'
    },
    { 
      question: 'Select your hobbies:', 
      type: 'checkbox', 
      name: 'hobbies', 
      options: ['Reading', 'Gaming', 'Traveling'],
      required: false
    },
    { 
      question: 'Leave a message:', 
      type: 'textarea', 
      name: 'message',
      required: false
    }
  ];

  let currentQuestion = 0;
  let formData = {};

  function showQuestion(index) {
    const q = questions[index];
    form.innerHTML = '';
    questionCounter.textContent = `Question ${index + 1} of ${questions.length}`;

    const label = document.createElement('label');
    label.textContent = q.question;
    label.htmlFor = q.name;
    form.appendChild(label);

    if (q.type === 'text' || q.type === 'email') {
      const input = document.createElement('input');
      input.type = q.type;
      input.name = q.name;
      input.id = q.name;
      input.required = q.required || false;
      
      if (formData[q.name]) {
        input.value = formData[q.name];
      }
      
      form.appendChild(input);
      
      if (q.required) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = q.error;
        error.id = q.name + '-error';
        form.appendChild(error);
      }
      
      input.addEventListener('input', (e) => {
        formData[q.name] = e.target.value;
        if (q.required && e.target.value.trim() !== '') {
          e.target.classList.remove('has-error');
          document.getElementById(q.name + '-error').style.display = 'none';
        }
      });
    } else if (q.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = q.name;
      textarea.id = q.name;
      textarea.required = q.required || false;
      
      if (formData[q.name]) {
        textarea.value = formData[q.name];
      }
      
      form.appendChild(textarea);
      
      if (q.required) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = q.error || 'This field is required';
        error.id = q.name + '-error';
        form.appendChild(error);
      }
      
      textarea.addEventListener('input', (e) => {
        formData[q.name] = e.target.value;
        if (q.required && e.target.value.trim() !== '') {
          e.target.classList.remove('has-error');
          document.getElementById(q.name + '-error').style.display = 'none';
        }
      });
    } else if (q.type === 'radio' || q.type === 'checkbox') {
      const optionsContainer = document.createElement('div');
      optionsContainer.className = q.type === 'radio' ? 'radio-options' : 'checkbox-options';
      
      q.options.forEach(option => {
        const optionWrapper = document.createElement('div');
        optionWrapper.classList.add('option-group');
        
        const input = document.createElement('input');
        input.type = q.type;
        input.name = q.name;
        input.value = option;
        input.id = q.name + '-' + option.toLowerCase().replace(/\s+/g, '-');
        if (q.required && q.type === 'radio') {
          input.required = true;
        }
        
        if (q.type === 'radio' && formData[q.name] === option) {
          input.checked = true;
        } else if (q.type === 'checkbox' && Array.isArray(formData[q.name])) {
          input.checked = formData[q.name].includes(option);
        }
        
        const inputLabel = document.createElement('label');
        inputLabel.htmlFor = q.name + '-' + option.toLowerCase().replace(/\s+/g, '-');
        inputLabel.textContent = option;
        
        optionWrapper.appendChild(input);
        optionWrapper.appendChild(inputLabel);
        optionsContainer.appendChild(optionWrapper);
        
        input.addEventListener('change', (e) => {
          if (q.type === 'radio') {
            formData[q.name] = e.target.value;
            if (q.required) {
              document.getElementById(q.name + '-error').style.display = 'none';
            }
          } else {
            if (!formData[q.name]) {
              formData[q.name] = [];
            }
            if (e.target.checked) {
              formData[q.name].push(e.target.value);
            } else {
              formData[q.name] = formData[q.name].filter(item => item !== e.target.value);
            }
          }
        });
      });
      
      form.appendChild(optionsContainer);
      
      if (q.required && q.type === 'radio') {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = q.error;
        error.id = q.name + '-error';
        form.appendChild(error);
      }
    }

    prevBtn.disabled = index === 0;
    nextBtn.style.display = index < questions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = index === questions.length - 1 ? 'inline-block' : 'none';
  }

  function validateCurrentQuestion() {
    const q = questions[currentQuestion];
    if (!q.required) return true;
    
    if (q.type === 'radio') {
      const selected = document.querySelector(`input[name="${q.name}"]:checked`);
      if (!selected) {
        document.getElementById(q.name + '-error').style.display = 'block';
        return false;
      }
      return true;
    } else {
      const input = document.querySelector(`[name="${q.name}"]`);
      if (!input.value || input.value.trim() === '') {
        input.classList.add('has-error');
        document.getElementById(q.name + '-error').style.display = 'block';
        return false;
      }
      return true;
    }
  }

  function nextQuestion() {
    if (!validateCurrentQuestion()) return;
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      showQuestion(currentQuestion);
    }
  }

  function prevQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion(currentQuestion);
    }
  }

  function validateAllQuestions() {
    let isValid = true;
    let firstInvalidQuestion = null;
    
    questions.forEach((q, index) => {
      if (q.required) {
        if (q.type === 'radio') {
          if (!formData[q.name]) {
            isValid = false;
            if (firstInvalidQuestion === null) {
              firstInvalidQuestion = index;
            }
          }
        } else {
          if (!formData[q.name] || formData[q.name].trim() === '') {
            isValid = false;
            if (firstInvalidQuestion === null) {
              firstInvalidQuestion = index;
            }
          }
        }
      }
    });
    
    if (!isValid && firstInvalidQuestion !== null) {
      currentQuestion = firstInvalidQuestion;
      showQuestion(currentQuestion);
      
      const q = questions[currentQuestion];
      if (q.type === 'radio') {
        document.getElementById(q.name + '-error').style.display = 'block';
      } else {
        const input = document.querySelector(`[name="${q.name}"]`);
        if (input) {
          input.classList.add('has-error');
          document.getElementById(q.name + '-error').style.display = 'block';
        }
      }
    }
    
    return isValid;
  }

  async function submitForm() {
    if (!validateAllQuestions()) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const response = await fetch('/.netlify/functions/submit-to-airtable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Submission failed');
      }
      
      formScreen.style.opacity = 0;
      setTimeout(() => {
        formScreen.classList.remove('active');
        successScreen.style.opacity = 0;
        successScreen.classList.add('active');
        successScreen.style.opacity = 1;
      }, 300);
      
    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  }

  startBtn.addEventListener('click', function() {
    introScreen.style.opacity = 0;
    setTimeout(() => {
      introScreen.classList.remove('active');
      formScreen.style.opacity = 0;
      formScreen.classList.add('active');
      showQuestion(0);
      formScreen.style.opacity = 1;
    }, 300);
  });

  prevBtn.addEventListener('click', prevQuestion);
  nextBtn.addEventListener('click', nextQuestion);
  submitBtn.addEventListener('click', submitForm);
  restartBtn.addEventListener('click', function() {
    successScreen.style.opacity = 0;
    setTimeout(() => {
      location.reload();
    }, 300);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && formScreen.classList.contains('active')) {
      e.preventDefault();
      if (currentQuestion < questions.length - 1) nextQuestion();
      else submitForm();
    }
  });
});
