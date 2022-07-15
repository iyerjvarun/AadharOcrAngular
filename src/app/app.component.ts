import { ThisReceiver } from '@angular/compiler';
import { Component, VERSION, ViewChild, ElementRef } from '@angular/core';
import * as Tesseract from 'tesseract.js';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  

  // GLOBAL VARIABLES
  name : string | null  ="";  //Aadhar Name OCR
  uid : string | null="";  // Aadhar Number OCR

  title = 'Document identifier & Aadhar Name Extractor'; 
  url : any = "";  //Image Preview File Path
  
  Result :any = "No File Selected"; 
  loaderdisplaysetter : any = "display : none;";  //Style Binder for Reconginising... and loader
  imgdisplaysetter : any = "display : none;"; //Style Binder for Image Preview



  onselectfile( e: any){
    this.Result = "";
    this.loaderdisplaysetter ="";

    if(e.target.files){
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload=(event : any)=>{
      //for Image Preview
      this.url=event.target.result;  
      this.imgdisplaysetter="";


// OCR using Tesseract.js for document identification
   const { createWorker } = require('tesseract.js');
      const worker = createWorker({
        logger: (m: any) => console.log(m), // Add logger here
      });


      (async () => {
  
        await worker.load();
        await worker.loadLanguage('eng+hin');
        await worker.initialize('eng+hin');
        const { data : { text }} = await worker.recognize(e.target.files[0]);
        console.log(text); 

        // CARD IDENTIFYING LOGIC for initial identification        

        if(text.includes('Unique Identification Authority of India') || text.includes('आम आदमी का अधिकार') || text.includes('आधार')){
          this.Result="Aadhar";


          // IF CARD IS AADHAR, OCR CALLED AGAIN FOR NAME AND NUMBER DETECTION.
          // THIS IS VERY SPECIFIC TO CROPPED E-AADHARS.
      
                  const { createWorker, createScheduler } = require('tesseract.js');

                  const scheduler = createScheduler();
                  const worker1 = createWorker({
                    logger: (m: any) => console.log(m), // Add logger here
                    });
                  const worker2 = createWorker({
                    logger: (m: any) => console.log(m), // Add logger here
                  });
                  const rectangles = [
                    { top: 264, left: 169, width: 300, height: 30 },
                    { top: 90, left: 173, width: 300, height: 20 },
                  ];

                  (async () => {
                    this.name="";
                    this.uid="";
                    await worker1.load();
                    await worker2.load();
                    await worker1.loadLanguage('eng+hin');
                    await worker2.loadLanguage('eng+hin');
                    await worker1.initialize('eng+hin');
                    await worker2.initialize('eng+hin');
                    scheduler.addWorker(worker1);
                    scheduler.addWorker(worker2);
                    const results = await Promise.all(rectangles.map((rectangle) => (
                      scheduler.addJob('recognize', e.target.files[0], { rectangle })
                    )));
                    console.log(results.map(r => r.data.text));
                            this.name=results[1].data.text;
                            this.uid=results[0].data.text;
                            this.loaderdisplaysetter="display: none;";
                    await scheduler.terminate();
                
                  })();

                  //END OF AADHAR DETAIL OCR DETECTION
        }

        //PAN CARD
        else if(text.includes('आयकर विभाग') || text.includes("INCOME TAX DEPARTMENT") || text.includes("GOVT. OF INDIA") || text.includes("Permanent Account Number")){
          this.Result='PAN';
          this.loaderdisplaysetter="display: none;";
        }

        // PASSPORT
        else if(text.includes("REPUBLIC OF INDIA") || text.includes("Passport") || text.includes("REPUBLIC") || text.includes("<IND<")){
          this.Result='Passport';
          this.loaderdisplaysetter="display: none;";
        }

        //ELSE 
        else{
          this.Result="The document is not valid. Please upload valid document. Upload high resolution image for proper scanning.";
          this.loaderdisplaysetter="display: none;";
        }

        await worker.terminate();
      })();
    };
  };
  }
}
