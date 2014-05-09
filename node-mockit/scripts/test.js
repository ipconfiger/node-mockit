exports.config={
    name:"test7",
    url:"/test",
    request:{
        method:"POST",
        headers:{Authorization:"Basic asdadasdasdasdasdasdasadsasdasd"},
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
