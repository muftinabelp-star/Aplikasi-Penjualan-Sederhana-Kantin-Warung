// ==========================================
// LOGIN
// ==========================================

let users = [
    {
        username: "admin",
        password: "12345"
    },
    {
        username: "rapael",
        password: "rapael"
    },
    {
        username: "mufti",
        password: "mutfi"
    },
    {
        username: "nadya",
        password: "nadya"
    }
       
];

function login() {
    alert("Fungsi login terpanggil");

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (
        (username === "admin" && password === "12345") ||
        (username === "rapael" && password === "rapael") ||
        (username === "mufti" && password === "mufti") ||
       x (username === "nadya" && password === "nadya")
    ) {
        alert("Login berhasil!");

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "block";

        tampilkanSemua();
    } else {
        document.getElementById("loginError").innerText =
            "Username atau password salah!";
    }
}
