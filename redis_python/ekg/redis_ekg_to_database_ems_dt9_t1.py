import redis
import time
import mysql.connector

isExit = False

# method for step 2
def read_data_from_redis():   
    # step 2.1: check length of 
    if r.llen('ekg_data_9') > 0:
        # step 2.2: pop first data in the array list of redis server
        data_from_pop = str(r.lpop('ekg_data_9').decode('utf-8'))
        
        # step 2.3: store data that is pushed to array again
        # note: we need to read the message not pop out 
        r.lpush('ekg_data_9', data_from_pop)
        
        return data_from_pop
    else:
        return 'no data'
    
def pop_out_data_from_redis():
    r.lpop('ekg_data_9').decode('utf-8')

# method for step 3
def send_data_to_server(data_from_pop):
    
    try:
        # 3.1 initial the database information
        mydb = mysql.connector.connect(
          host="10.10.182.215",
          user="EMSAdmin",
          passwd="EmsAdmin00",
          database="EMS"
        )
        
        # 3.2 initial data for send to database
        data_split = data_from_pop.split('|')
        dev_type_id = str(data_split[0])
        dev_id = str(data_split[1])
        data = str(data_split[2])
        
        # 3.3 execute the insert query
        mycursor = mydb.cursor()
        sql = "INSERT INTO EKGTransaction (DevTypeID, DevID,Data) VALUES (%s, %s, %s)"
        val = (dev_type_id, dev_id, data)
        mycursor.execute(sql, val)
        mydb.commit()
        
        # 3.4 print it and return True
        print(mycursor.rowcount, "record inserted.")
        return True
    except Exception as e:
        print('error in send data to server process... : '+str(e))
        return False
            
while not isExit:
    try:
        # step 1: connect the redis server
        print('step1')
        pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
        r = redis.Redis(connection_pool=pool)
        
        while True:
            # step 2: pop data from redis
            print('step2')
            try:
                data_from_redis = read_data_from_redis()
                if data_from_redis == 'no data':
                    time.sleep(0.1)
                    continue
            except Exception as e:
                print('error in pop process... : '+str(e))
                time.sleep(0.1)
                continue
            
            # step 3: send data to server
            print('step3')
            status = send_data_to_server(data_from_redis)
            if status == True:
                # send success pop the success data from redis
                pop_out_data_from_redis()
                
    except KeyboardInterrupt:
        print('interrupt process')
        isExit = True
        pass
    except Exception as e:
        print('something went wrong in the system... : '+str(e))
        time.sleep(0.1)
        pass
