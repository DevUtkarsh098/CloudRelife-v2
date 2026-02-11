  🌪️ AWS Disaster Data Orchestration Pipeline

An intelligent,  event-driven disaster data orchestration system  built entirely on  AWS serverless technologies , designed to process, enrich, and alert on real-time incident data with zero manual intervention.

 

  📸 Architecture Overview

[Refer Architecture.jpg]

 

  🧠 End-to-End Workflow

1.  User / Field Officer  sends incident data using the  ingestAPI (API Gateway)  via a simple HTTP `PUT` request.
2.  IngestFn (Lambda)  validates and stores raw incident data in  DynamoDB (IncidentDataTable) .
3.  EventBridge  detects the DynamoDB insert event and automatically triggers the  Step Functions workflow  — *DisasterPipeline*.
4. The Step Function orchestrates the data flow through:
   -  PreprocessIncidentFn  – Cleans and standardizes data.  
   -  ProcessingFn  – Runs inference through ML model stored in S3 or SageMaker.  
   -  GetLatestIncidentWithAlert  – Fetches latest processed record and triggers alerts.
5. Final processed data is stored in  ProcessedIncidentsTable  (DynamoDB).
6. The  getAPI (API Gateway)  allows external users or dashboards to retrieve the most recent alerts or processed data.

 

  🧩 AWS Services Explained

   1.  Amazon API Gateway 
- Acts as the  entry and exit point  of the system.  
- Two APIs are deployed:
  -  ingestAPI (PUT)  → For submitting new incident data.  
  -  getAPI (GET)  → For retrieving the latest processed incident.
- Provides authentication, logging, and secure data flow to Lambda.

 

   2.  AWS Lambda 
The serverless compute backbone of this architecture.  
Each Lambda handles a distinct stage in the pipeline:

| Lambda Function | Description |
|      |    --|
|  IngestFn  | Validates incoming incident data, adds timestamps, and stores it in DynamoDB. |
|  PreprocessIncidentFn  | Performs text cleaning, formatting, and ensures all attributes (e.g., severity, location) are standardized. |
|  ProcessingFn  | Invokes the ML inference model (via SageMaker or S3) to enrich the record with severity, urgency, population density, and nearest resources. |
|  GetLatestIncidentWithAlert  | Retrieves the most recent processed incident, checks alert thresholds, and updates status or pushes notifications to the UI/API. |

All Lambdas are written in  Python 3.9 , use  boto3  for AWS integration, and are fully event-driven.

 

   3.  AWS Step Functions 
- Orchestrates the pipeline using a visual workflow.  
- Ensures  sequential execution  of:
  1. `IngestFn`
  2. `PreprocessIncidentFn`
  3. `ProcessingFn`
  4. `GetLatestIncidentWithAlert`
- Provides  retry logic ,  state tracking , and  error handling .  
- Reduces manual integration complexity between Lambda functions.

 

   4.  Amazon DynamoDB 
Two tables are used to manage lifecycle stages of data:

| Table | Purpose | Key |
|  --|   -| --|
|  IncidentDataTable  | Stores raw incident records submitted by users. | `incident_id` |
|  ProcessedIncidentsTable  | Stores enriched data after ML inference and alerting. | `incident_id` |

- Fully serverless NoSQL database with millisecond latency.  
- Integrated with EventBridge to trigger the pipeline automatically.

 

   5.  Amazon EventBridge 
- Watches  DynamoDB stream events  (INSERT operations).  
- When a new record is added to `IncidentDataTable`, it triggers the  Step Function execution .  
- Enables a completely  automated, event-driven pipeline  without any human intervention.

 

   6.  Amazon S3 (disaster-reference-data) 
- Stores:
  -  Reference datasets  (like disaster risk indices, population maps, and resource locations).  
  -  Pre-trained inference model  used by the `ProcessingFn` Lambda.  
- S3 paths are read dynamically during Lambda execution for flexibility and model updates.

 

   7.  Amazon SageMaker 
- Hosts or trains the  disaster severity inference model .
- The model predicts:
  - Severity score (1–5)
  - Urgency level
  - Estimated people affected
  - Disaster risk index
- The output is combined with location-based resources from S3 and stored back in DynamoDB.

 

   8.  Amazon CloudWatch 
- Centralized monitoring and logging.
- Tracks Lambda invocations, Step Function executions, and errors.  
- Alerts can be configured to notify via  SNS  for operational monitoring.

 

  ⚙️ Step Function Definition

```json
{
  "Comment": "Disaster Response Data Pipeline",
  "StartAt": "IngestFn",
  "States": {
    "IngestFn": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:043470661911:function:IngestFn",
      "Next": "PreprocessIncidentFn"
    },
    "PreprocessIncidentFn": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:043470661911:function:PreprocessIncidentFn",
      "Next": "ProcessingFn"
    },
    "ProcessingFn": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:043470661911:function:ProcessingFn",
      "Next": "GetLatestIncidentWithAlert"
    },
    "GetLatestIncidentWithAlert": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:043470661911:function:GetLatestIncidentWithAlert",
      "End": true
    }
  }
}

🧰 Tools & Technologies

AWS Lambda

AWS Step Functions

Amazon DynamoDB

Amazon S3

Amazon SageMaker

Amazon EventBridge

API Gateway

Amazon CloudWatch

Python (boto3, json, datetime)



🧭 Key Features

✅ 100% Serverless and Event-driven
✅ Auto-triggered pipeline (no manual runs)
✅ Real-time alerting and data enrichment
✅ ML-powered severity and urgency scoring
✅ Modular design — each Lambda handles a single task





💡 Future Enhancements

Real-time alerts via SNS / WebSocket API

Integration with AWS QuickSight dashboards

Cross-region disaster coordination

Batch analytics for historical trend visualization
