async function test() {
    const parentEmail = "parent_test1@gmail.com";
    const childEmail = "sara_test1@gmail.com";
    const pass = "123456";

    console.log("Registering parent...");
    let res = await fetch("https://backend-autism-production-a8ef.up.railway.app/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail, password: pass, fullName: "Parent" })
    }).then(r => r.json());

    if(res.accessToken) {
        console.log("Parent registered and got token.");
    } else if (res.message === "Email already exists") {
        console.log("Parent exists. Logging in...");
        res = await fetch("https://backend-autism-production-a8ef.up.railway.app/auth/login", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: parentEmail, password: pass })
        }).then(r => r.json());
    }

    const parentToken = res.accessToken;
    console.log("Creating child...");
    let childRes = await fetch("https://backend-autism-production-a8ef.up.railway.app/auth/child", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + parentToken },
        body: JSON.stringify({ childEmail, childPassword: pass, childName: "Sara", gender: "FEMALE" })
    }).then(r => r.json());

    console.log("Child creation:", childRes);

    console.log("Logging in as child...");
    let loginRes = await fetch("https://backend-autism-production-a8ef.up.railway.app/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: childEmail, password: pass })
    }).then(r => r.json());

    console.log("Child login:", loginRes);
}

test();
