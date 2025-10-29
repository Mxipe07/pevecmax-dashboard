export const config={runtime:'edge'};
export default async function handler(req){
  try{
    const body=await req.json();
    const msg=String(body?.message??'').slice(0,4000);
    const r=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-4o-mini',messages:[
        {role:'system',content:'Antworte kurz, klar, deutsch.'},
        {role:'user',content:msg}
      ]})
    });
    if(!r.ok)return new Response(await r.text(),{status:r.status});
    const data=await r.json();
    return new Response(JSON.stringify({reply:data?.choices?.[0]?.message?.content||''}),
      {headers:{'Content-Type':'application/json'}});
  }catch(e){return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{'Content-Type':'application/json'}});}
}