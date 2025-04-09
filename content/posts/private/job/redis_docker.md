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

後來又想了一下 直接在script加上判斷是不是有container在跑就可以了 沒有的話就起docker compose up -d

--- 

# Redis Single Login Function - Development and Deployment Problem Solving Record

## Feature Requirements
The requirement is that when the same user logs in from a second device, the system should automatically log out the user from the first device, ensuring that only one device can be used at a time.

---

## Background
This feature requires using Redis to store login statuses and check if there are other login records. To avoid affecting the production environment directly by deploying Redis, I decided to create a test machine to experiment and verify the solution.

---

## Step 1: Testing Redis + Docker on Local Machine
I was not familiar with Docker, so I proceeded step by step.
- Wrote the `docker-compose.yml` to define the Redis service
- Wrote `redis.conf` to adjust `bind` and `protected-mode` settings
- Successfully ran `docker compose up -d` locally and verified Redis was working.

---

## Step 2: Modify the Frontend UI
- Adjusted the login flow and integrated the front end to manage the login state using Redis
- Tested if the feature "log out the user on the first device when the second device logs in" worked properly.

---

## Step 3: Create a Test Machine
- To avoid affecting the production environment, I used AWS EC2's AMI feature to quickly clone the existing EC2 (8GB instance, so it was fast)
- Verified that the app worked normally on the new machine.

---

## Step 4: Git Checkout Branch Failed
- I expected to checkout the test branch using `git fetch` and `git checkout`
- Found that the branch did not exist → suspected a permission issue
- Checked SSH key and remote, both seemed fine.

### Discovery:
The repo had been moved from my personal account to a GitHub organization, and by default, the organization disables Deploy Keys.

✅ Solution:
- Enabled the Deploy Key feature in the GitHub organization settings.
- After modifying the Git remotes on both machines, the branch could be pulled normally.

---

## Step 5: Test Redis
- After checking out the branch, ran `docker compose up -d`
- Found that `docker-compose: command not found` → Docker and Docker Compose were not installed on EC2.
- Installed Docker and Docker Compose plugin version.

### Verify Redis:
```bash
docker ps
# Redis container should be running

docker exec -it $(docker ps -qf "ancestor=redis:alpine") redis-cli ping
# Expect "PONG", which means Redis is working fine.
```
-- 
## Step 6: Test Redis
test if the revoke feature is working when login again

## Potential Issue:
There could be a race condition where Redis is not yet running when the app starts.
Solution Discussion (3 Options)
Option 1: Split into Two PRs/Commits

PR 1: Deploy Redis and Docker environment

PR 2: Deploy the code changes that require Redis

✅ Clear, low risk, easy to roll back.

Option 2: Add `docker compose up -d` to the script
Ensure Redis is up before starting the app, to avoid the race condition.

✅ Quick, safe transition.

Option 3: App should not crash if Redis is not available
Make sure the app continues running if Redis is down (use try/catch, lazy connect, fallback).

✅ Increases fault tolerance, but adds some complexity to the code.

Conclusion and Reflection
Using a test machine to deploy new components is a good practice to avoid disrupting production services.

Docker for Redis provides isolation and consistency, which is more manageable compared to installing Redis directly on EC2.

Race conditions are a key concern in deployment, and it's important to plan for fallback mechanisms.

Pre-planning fallback and PR strategies can help reduce deployment risks.


---

# Redis 單一登入功能 - 開發與部署問題處理紀錄

## 功能需求
功能需求是當同一個使用者在第二台裝置登入時，系統應自動登出第一台裝置，確保同時只能在一台裝置上使用系統。

---

## 背景
這個功能需要使用 Redis 儲存登入狀態並檢查是否有其他登入紀錄。為了避免直接在正式環境部署 Redis 影響服務，我決定建立一台測試機來進行實驗與驗證。

---

## Step 1: 本機測試 Redis + Docker
我對 Docker 的了解不深，所以一步一步進行。
- 撰寫 `docker-compose.yml` 定義 Redis 服務
- 撰寫 `redis.conf` 調整 `bind` 和 `protected-mode` 設定
- 成功在本機執行 `docker compose up -d` 並驗證 Redis 是否正常運作。

---

## Step 2: 修改前端 UI
- 調整登入流程並在前端整合 Redis 管理登入狀態
- 測試「第二台登入會自動登出第一台」的邏輯是否正常。

---

## Step 3: 建立測試機
- 為了避免影響正式機，使用 AWS EC2 的 AMI 功能快速複製目前的 EC2（8GB 實例，速度還不錯）
- 測試應用在新機上是否能正常運作。

---

## Step 4: Git Checkout 分支失敗
- 預期透過 `git fetch` + `git checkout` 切換測試分支
- 發現無法找到分支 → 懷疑權限問題
- 檢查了 SSH 金鑰與 remote 設定，看起來都沒問題。

### 發現：
原來是 repo 從個人帳號移動到 GitHub 組織下，並且組織預設停用了 Deploy Key 功能。

✅ 解法：
- 開啟 GitHub 組織設置中的 Deploy Key 功能。
- 修改兩台機器的 Git remote 後，正常可以 pull 分支。

---

## Step 5: 測試 Redis
- 切換分支後執行 `docker compose up -d`
- 發現 `docker-compose: command not found` → EC2 沒安裝 Docker 和 Docker Compose。
- 安裝 Docker 和 Docker Compose plugin 版本。

### 驗證 Redis：
```bash
docker ps
# 確認 Redis container 是否在運行

docker exec -it $(docker ps -qf "ancestor=redis:alpine") redis-cli ping
# 預期回應 PONG，表示 Redis 正常運作。
```

## Step 6: 考慮正式環境部署
目前的 GitHub Actions 部署腳本如下：
script: |
  cd projects/learning-backend
  git fetch
  git reset --hard origin/master
  npm install
  tsc
  pm2 restart tt-express-server || pm2 start dist/src/app.js --name tt-express-server

## 潛在問題：
存在 race condition，可能 Redis 尚未啟動時就啟動了 app，導致錯誤。

解決方案討論（3 種方案）
方案 1：分兩個 PR / Commit
PR 1：部署 Redis 和 Docker 環境

PR 2：部署需要 Redis 的程式碼

✅ 清晰、低風險，容易回滾。

方案 2：先把 docker compose up -d 加到部署腳本裡
確保 Redis 啟動後才啟動 app，避免 race condition。
後來又想了一下 直接在script加上判斷是不是有container在跑就可以了 沒有的話就起docker compose up -d

✅ 快速且安全的過渡方案。

方案 3：如果 Redis 不可用，app 不會掛掉
確保即使 Redis 失敗，app 仍然運作（使用 try/catch，懶加載，fallback）。

✅ 提升容錯性，但需要在程式中增加一些複雜度。

結論與反思
使用測試機部署新元件是一個避免影響正式服務的良好習慣。

Docker 用於 Redis 提供了隔離性與一致性，比起直接在 EC2 上安裝 Redis 更加便於管理。

race condition 是部署過程中常被忽視但非常關鍵的問題，需要預先規劃。

預先設計 fallback 機制與 PR 策略能有效降低部署風險。