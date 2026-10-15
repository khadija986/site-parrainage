const ForgetButton = document.getElementById("ForgetButton");
const RetourButton = document.getElementById("RetourButton");
const ConnexionForm = document.getElementById("ConnexionForm");
const ForgetForm = document.getElementById("ForgetForm");
const flipCard = document.getElementById("flipCard");

ForgetButton.addEventListener("click", function () {
    ConnexionForm.style.display = "none";
    ForgetForm.style.display = "block";
    
});
RetourButton.addEventListener("click", function () {

    ForgetForm.style.display = "none";
    ConnexionForm.style.display = "block";
    

});

ForgetButton.addEventListener("click", function () {
    flipCard.classList.add("flipped");
    ConnexionForm.setAttribute("aria-hidden", "true");
    ConnexionForm.inert = true;
    ForgetForm.inert = false;
    ForgetForm.querySelector("input[type='email']").focus();
});

RetourButton.addEventListener("click", function () {
    flipCard.classList.remove("flipped");
    ConnexionForm.setAttribute("aria-hidden", "false");
    ConnexionForm.inert = false;
    ForgetForm.inert = true;
    ForgetForm.setAttribute("aria-hidden", "true");
    ConnexionForm.querySelector("input[type='tel']").focus();
});
