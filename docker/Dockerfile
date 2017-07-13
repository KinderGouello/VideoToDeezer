from node:6.11

RUN useradd --user-group --create-home --shell /bin/false nodejs
RUN npm install -g yarn
RUN npm install -g flow-bin
RUN npm install -g nodemon

ENV HOME=/home/nodejs
ENV NODE_ENV=production

USER nodejs
WORKDIR $HOME/app