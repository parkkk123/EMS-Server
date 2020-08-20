# EMS-Server-Docker

ขั้นตอนการติดตั้งระบบ และวิธีการรัน containers

## Installation
สร้าง Network overlay เพื่อใช้ในการติดต่อภายในกันเอง
```bash
docker network create -d overlay EMS
```

ทำการ Build images 
```bash
docker-compose build
```

การรัน Images และให้เชื่อมอยู่ในวง Network overlay และตั้งชื่อให้กับ Containers ที่จะรัน
```bash
docker service create --name EMS_redis_server  --replicas=1 --network EMS --publish target=6379,published=6379 redis

docker service create --name EMS_Patient_web  --replicas=1 --network EMS --publish target=3100,published=3100 docker_ems_patient

docker service create --name EMS_Doctor_web  --replicas=1 --network EMS --publish target=3400,published=3400 docker_ems_doctor

docker service create --name EMS_Fr_web  --replicas=1 --network EMS --publish target=3200,published=3200 docker_ems_fr

docker service create --name EMS_backend_api  --replicas=1 --network EMS --publish target=8081,published=8081 docker_backend_api
```

การรัน Images ของ Services ที่ใช้ส่งข้อมูลจาก Redis server เข้าสู่ DB
```bash
sh ./start_service_redis.sh
```

## คำสั่งเพิ่มเติม

ดู Images ทั้งหมด
```bash
docker image ls
```

ลบ Image และ Container
```bash
docker rmi -f IMAGE
docker rm -f CONTAINERID
```

ดู Containers ทั้งหมด
```bash
docker container ls
```

ดู Container ที่กำลังรันปัจจุบัน และดู Container ID
```bash
docker ps 
```

ใช้ในการลบ Service ที่รันอยู่ เพื่อรัน Service ในชื่อ name เดิม
```bash
docker service rm CONTAINERID
```
ต้องการใช้งานคำสั่ง bash ภายใน container
```bash
docker exec -it CONTAINERID bash
```

ดู Networks ของ Docker
```bash
docker network ls
```

## TO DO
<b>Frontend</b>

Web Service | Installation | Fixed Font
:------------ | :-------------| :-------------
Patient web |  :white_check_mark: | :x:
Fr web |   :white_check_mark: | :x:
Doctor web |   :white_check_mark: | :x:
Ambulance web |   :x: | :x:

<b>Backend</b>

Backend Service | Installation | Host DNS | Note
:------------ | :-------------| :------------- | :-------------
API Server |  :white_check_mark: | :x: | หลังติดตั้ง Database ให้เปลี่ยน Host ของ mysql connection ไปใช้ชื่อ parameter name ที่ตั้งตอนสั่งรัน docker service 
Redis Server |   :white_check_mark: | - | -
EKG & Dev Services |   :white_check_mark: | :white_check_mark: | -
Database |   :x: | :x: |  -
