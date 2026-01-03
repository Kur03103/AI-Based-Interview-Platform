(async () => {
    console.log("Start dynamic import test");
    try {
        const express = await import('express');
        console.log("✅ express imported");
    } catch (e) { console.error("❌ express failed", e); }

    try {
        const multer = await import('multer');
        console.log("✅ multer imported");
    } catch (e) { console.error("❌ multer failed", e); }

    try {
        const cors = await import('cors');
        console.log("✅ cors imported");
    } catch (e) { console.error("❌ cors failed", e); }

    try {
        const mistral = await import('@mistralai/mistralai');
        console.log("✅ @mistralai/mistralai imported");
    } catch (e) { console.error("❌ @mistralai/mistralai failed", e); }

    try {
        const dotenv = await import('dotenv');
        console.log("✅ dotenv imported");
    } catch (e) { console.error("❌ dotenv failed", e); }

    console.log("End dynamic import test");
})();
