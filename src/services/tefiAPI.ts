
let token: string | null = null
async function tefiRequest(method: string, args: any): Promise<any> {
    let url = process.env.URL_API_TEFI
    if (!url) return
    url = url + "/service/v4_1/rest.php"

    const postData = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            method: method,
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: JSON.stringify(args),
        }),
    };

    const response = await fetch(url, postData);

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    try{
        const result = await response.json();
        return result;
    } catch(error){
        throw new Error(`Error parsing JSON: ${error}`);
    }
    
}

export async function GetToken() {
    if (token) return token

    console.log("Obteniendo token...")
    const response = await tefiRequest("login", {
        'user_auth': {
            'user_name': process.env.TEFI_USER,
            'password': process.env.TEFI_PASS
        },
        'application_name': process.env.TEFI_NAME,
        'name_value_list': {}
    })
    token = response.id
    return token ?? ""
}

export async function GetPDF(idFitac: string, templateId: string) {
    let url = process.env.URL_API_TEFI
    if (!url) return
    url = url + "/index.php?entryPoint=generatePdf"

    const payload = new URLSearchParams({
        module: 'Fitac_fitac',
        task: 'pdf',
        templateID: templateId,
        uid: idFitac,
    });

    const sessionId = await GetToken()
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `PHPSESSID=${sessionId}; Path=/;`
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: payload.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.arrayBuffer()

        const cookies = parseCookie(response.headers.getSetCookie()[0])
        if(cookies["loginErrorMessage"] && cookies["loginErrorMessage"] == 'LBL_SESSION_EXPIRED'){
            console.log('Reautenticando...')
            token = null
            return GetPDF(idFitac, templateId)
        }
        return data
    } catch (error) {
        console.error('Error making the request:', error);
    }
}

function parseCookie(cookieString: string) {
    let cookieObject: { [key: string]: string } = {};
    let cookieArray: string[] = cookieString.split('; ');
    
    cookieArray.forEach(cookie => {
        let [key, value]: string[] = cookie.split('=');
        cookieObject[key] = value;
    });

    return cookieObject;
}
