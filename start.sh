#/bin/bash
docker service rm EMS_redis_python_dev_dt2_t1
docker service create --name EMS_redis_python_dev_dt2_t1  --replicas=1 --network EMS docker_redis_python_dev_dt2_t1
docker service rm EMS_redis_python_dev_dt3_t1
docker service create --name EMS_redis_python_dev_dt3_t1  --replicas=1 --network EMS  docker_redis_python_dev_dt3_t1
docker service rm EMS_redis_python_ekg_dt4_t1
docker service create --name EMS_redis_python_ekg_dt4_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt4_t1
docker service rm EMS_redis_python_ekg_dt5_t1
docker service create --name EMS_redis_python_ekg_dt5_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt5_t1
docker service rm EMS_redis_python_ekg_dt6_t1
docker service create --name EMS_redis_python_ekg_dt6_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt6_t1
docker service rm EMS_redis_python_ekg_dt7_t1
docker service create --name EMS_redis_python_ekg_dt7_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt7_t1
docker service rm EMS_redis_python_ekg_dt8_t1
docker service create --name EMS_redis_python_ekg_dt8_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt8_t1
docker service rm EMS_redis_python_ekg_dt9_t1
docker service create --name EMS_redis_python_ekg_dt9_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt9_t1
docker service rm EMS_redis_python_ekg_dt10_t1
docker service create --name EMS_redis_python_ekg_dt10_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt10_t1
docker service rm EMS_redis_python_ekg_dt11_t1
docker service create --name EMS_redis_python_ekg_dt11_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt11_t1
docker service rm EMS_redis_python_ekg_dt12_t1
docker service create --name EMS_redis_python_ekg_dt12_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt12_t1
docker service rm EMS_redis_python_ekg_dt13_t1
docker service create --name EMS_redis_python_ekg_dt13_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt13_t1
docker service rm EMS_redis_python_ekg_dt14_t1
docker service create --name EMS_redis_python_ekg_dt14_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt14_t1
docker service rm EMS_redis_python_ekg_dt15_t1
docker service create --name EMS_redis_python_ekg_dt15_t1  --replicas=1 --network EMS  docker_redis_python_ekg_dt15_t1