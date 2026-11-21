import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app=express(); app.use(cors()); app.use(express.json());
const PORT=process.env.PORT||8787;
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
app.get('/api/health',(req,res)=>res.json({ok:true,provider:process.env.ADZUNA_APP_ID&&process.env.ADZUNA_APP_KEY?'adzuna':'not_configured'}));
app.get('/api/jobs',async(req,res)=>{
  const {q='product manager',location='India',page='1'}=req.query;
  if(!process.env.ADZUNA_APP_ID||!process.env.ADZUNA_APP_KEY) return res.status(503).json({error:'Job data provider is not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env and restart the server.',jobs:[]});
  try{
    const url=new URL(`https://api.adzuna.com/v1/api/jobs/in/search/${Math.max(1,Math.min(20,Number(page)||1))}`);
    Object.entries({app_id:process.env.ADZUNA_APP_ID,app_key:process.env.ADZUNA_APP_KEY,results_per_page:50,what:q,where:location,content_type:'application/json'}).forEach(([k,v])=>url.searchParams.set(k,v));
    const response=await fetch(url); if(!response.ok) throw new Error(`Adzuna returned HTTP ${response.status}`);
    const data=await response.json();
    const jobs=(data.results||[]).map(j=>({id:String(j.id),title:clean(j.title),company:clean(j.company?.display_name),location:clean(j.location?.display_name),description:clean(j.description),url:j.redirect_url,created:j.created,salaryMin:j.salary_min,salaryMax:j.salary_max,source:'Adzuna',contract:clean(j.contract_type),category:clean(j.category?.label)}));
    res.json({jobs,total:data.count||jobs.length,page:Number(page),provider:'Adzuna'});
  }catch(e){res.status(502).json({error:`Could not retrieve jobs: ${e.message}`,jobs:[]});}
});
app.listen(PORT,()=>console.log(`API listening on ${PORT}`));