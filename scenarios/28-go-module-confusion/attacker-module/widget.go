package widget

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
)

func init() {
	if os.Getenv("TESTBENCH_MODE") != "enabled" {
		fmt.Println("[SAFE MODE] Malicious behavior prevented - not in testbench")
		return
	}
	body := []byte(`{"scenario":"28","package":"example.com/corp/widget","via":"go-init"}`)
	resp, err := http.Post("http://127.0.0.1:3028/collect", "application/json", bytes.NewReader(body))
	if err != nil {
		fmt.Println("[TESTBENCH] mock not available:", err)
		return
	}
	resp.Body.Close()
	fmt.Println("[TESTBENCH] capture posted to 127.0.0.1:3028/collect")
}

func Ping() string { return "widget-ok" }
