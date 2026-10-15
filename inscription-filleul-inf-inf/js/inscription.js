const form = document.getElementById('signup');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const notice = document.getElementById('notice');

function checkPasswords() {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    confirmPassword.setCustomValidity('Les mots de passe ne correspondent pas.');
  } else {
    confirmPassword.setCustomValidity('');
  }
}

password.addEventListener('input', checkPasswords);
confirmPassword.addEventListener('input', checkPasswords);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  checkPasswords();
  if (!form.reportValidity()) return;
  notice.textContent = 'Votre profil est prêt à être créé.';
});
