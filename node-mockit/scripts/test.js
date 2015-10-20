exports.config={
    name:"test7",
    url:"/test",
    request:{
        method:"POST",
        headers:{Authorization:"Bearer 93d8b0977597062acb4f5d9b22f8ef78"},
        type:"body",
        data:{
            name:"alex",
            password:"1qasw2",
        }
    },
    response:{
        content_type:"application/json",
        success:{
            rs:true,
            info:""
        },
        error:{
            rs:false,
            error:"error info"
        }
    }
}
