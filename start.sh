echo 'start...'
pm2 delete all
pm2 start npm --watch --name webpack-agent -- run dev
echo 'start success'
