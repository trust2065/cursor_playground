功能是 如果同一個使用者在第二機器登入系統 第一機器就要停止授權 不讓使用 

ok 新故事 我要建立一個新的測試機 因為我想要建redis 需要用docker建立 但是這樣可能會搞壞停掉正式機 所以才要見一個測試機

step1

我對docker的了解不深 所以一步一步前進
寫好了 docker-compose.yaml 
寫好redis設定
先在本機run起來

step2
修改前端ui
測試在前端可以成功達到效果

step3
deploy到ec2 測試機
我查了一下 發現可以用ami功能複製整個ec2 (8g所以沒有很久) 然後測試可以正常使用

step4
checkout new branch 竟然失敗
懷疑複製有權限問題
檢查了ssh key有
檢查了remote看起來也對

進去repo查看deploy key竟然是disabled
想起之前把repo從private 轉移成under organisation真相大白
organisation預設deploy key不開啟 修改後就可以pull了
兩邊機器都改好remote後

step5
換branch 開始測試
docker-compose up -d
docker-compose: command not found
要裝docker 和docker-compose

docker compose up -d
ok

測試redis有跑起來 done!
測試api變更

docker ps
你應該會看到：

一個是 Redis（name 類似 project_redis_1）

docker exec -it <redis-container-name> redis-cli ping
應該會回：PONG


step6
思考正式環境
我有deploy的script
這樣docker redis和 程式碼會有race condition

我有三個解法
1 分兩個commits 兩個PR
一個是docker, redis
第二個是code changes

2 先把docker compose up -d 加到script裡面
然後下一個PR再拿掉

3 如果沒有redis code不能掛掉
