
import React, { useState, useEffect } from "react";
import { MyAuthService } from "@/services/authService";

const apiBaseUrl = "https://n8n.srv799538.hstgr.cloud/webhook/";
const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
const AUTH_KEY =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";


export const fetchDataService = async (endPoint, method) => {
    try{
        const response = await fetch(apiBaseUrl+endPoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                apikey: API_KEY,
                Authorization: AUTH_KEY,
                jwt_token: MyAuthService.getToken(),
                session_id: MyAuthService.getSessionId(),
            }
        });
        const data = await response.json();
        //console.log("Fetched data Hook:", data);
        return data;
    } catch(error) {
        return {"status":"error","message":error}
    }
}

export const userModuleService = async (endPoint, method, rowData) => {
    try{
        const response = await fetch(apiBaseUrl+endPoint,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    apikey: API_KEY,
                    Authorization: AUTH_KEY,
                    "Content-Profile": "srtms",
                    jwt_token: MyAuthService.getToken(),
                    session_id: MyAuthService.getSessionId(),
                },
                body: JSON.stringify(rowData)
            }
        );
        const ret = await response.json();
        //console.log(ret);
        return ret;
    } catch(error) {
        return {"status":"error","message":error}
    }
}