interface ApiResponse {
  ok: boolean;
  status: number;
  text: string;
}

export const makeApiRequest = async (url: string, data: any): Promise<ApiResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic YWRtaW46YWRtaW4=');
    
    xhr.onload = function() {
      console.log('XHR Response:', xhr.status, xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          ok: true,
          status: xhr.status,
          text: xhr.responseText
        });
      } else {
        reject(new Error(`HTTP Error: ${xhr.status}`));
      }
    };
    
    xhr.onerror = function(e) {
      console.error('XHR Error:', e);
      reject(new Error('Network Error'));
    };

    const jsonString = JSON.stringify(data);
    console.log('Sending data:', jsonString);
    xhr.send(jsonString);
  });
};
