const Promise = require('bluebird');
const log = require('log4js').getLogger('githubClient');
const request = require('requestretry');

const organization = process.env.GITHUB_ORGANIZATION;

const gitHubClient = {

  options: {
    baseUrl: process.env.GITHUB_API_BASE_URL,
    fullResponse: false,
    json: true,
    headers: {
      'User-Agent': process.env.GITHUB_USER_AGENT,
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${process.env.GITHUB_USER_TOKEN}`
    }
  },

  createRepository(name) {
    const options = this.options;

    options.uri = '/user/repos';
    options.body = {
      name: name
    };

    request.post(options)
      .then(response => {
        log.info(response);
      })
      .catch(error => {
        log.error(error);
      });
  },

  createOrganizationRepository(name, organization) {
    return new Promise((resolve, reject) => {
      const options = this.options;

      options.uri = `/orgs/${organization}/repos`;
      options.body = {
        name: name
      };

      request.post(options)
        .then(response => {

          if (response.errors) {
            const errors = response.errors
              .map(error => error.message)
              .join(' ,');

            reject(`GitHub: ${errors}`);
          } else {
            resolve('GitHub: repo created successfully.');
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addUserToRepository(username, repo){
    return new Promise((resolve, reject) => {
      const options = this.options;

      options.uri = `/repos/${organization}/${repo}/collaborators/${username}`;
      options.headers.Accept = 'application/vnd.github.swamp-thing-preview+json';
      options.body = {
        permission: 'admin'
      };

      /** Disclaimer: this endpoint is terribly unstable,
       * it tends to return 'undefined' upon some successful calls
       * for reasons not known to man.
       * **/
      request.put(options)
        .then(response => {
          if (response !== undefined && response.errors !== undefined) {
            const errors = response.errors
              .map(error => error.message)
              .join(' ,');

            reject(`GitHub: ${errors}`)
          } else {
            resolve('GitHub: user added successfully.');
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};

module.exports = gitHubClient;